import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { mouthOpen } from './useSpeaker.js'

// three.js で組み立てた 3D の近大マグロ（外部のモデルファイルは使わない）。
// 泳ぐように揺れ、まばたきし、話している間は口が開閉する。
export default function Avatar3D({ talkingRef, className = '', onFail }) {
  const host = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = host.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      setFailed(true)
      onFail?.()
      return
    }
    const size = () => [el.clientWidth || 300, el.clientHeight || 240]
    let [w, h] = size()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 100)
    camera.position.set(0, 0.25, 7)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x475569, 1.3))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(-2, 3, 4)
    scene.add(key)

    const disposables = []
    const mat = (color, extra = {}) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.25, ...extra })
      disposables.push(m)
      return m
    }
    const geo = (g) => {
      disposables.push(g)
      return g
    }
    const sphere = geo(new THREE.SphereGeometry(1, 48, 32))
    const cone = geo(new THREE.ConeGeometry(0.5, 1, 4))

    const fish = new THREE.Group()
    scene.add(fish)

    const navy = mat(0x1e3a8a)
    const body = new THREE.Mesh(sphere, navy)
    body.scale.set(1.75, 1, 0.85)
    fish.add(body)
    const belly = new THREE.Mesh(sphere, mat(0xe5e7eb, { metalness: 0.5 }))
    belly.scale.set(1.62, 0.72, 0.8)
    belly.position.y = -0.3
    fish.add(belly)

    // しっぽ（2枚のひれ）。根元を軸に左右に振る
    const tail = new THREE.Group()
    tail.position.x = 1.6
    fish.add(tail)
    for (const sgn of [1, -1]) {
      const fin = new THREE.Mesh(cone, navy)
      fin.scale.set(0.5, 1.1, 0.12)
      fin.rotation.z = -Math.PI / 2 + sgn * 0.75
      fin.position.set(0.4, sgn * 0.35, 0)
      tail.add(fin)
    }
    // 背びれ・胸びれ・黄色い小離鰭
    const dorsal = new THREE.Mesh(cone, navy)
    dorsal.scale.set(0.5, 0.8, 0.1)
    dorsal.position.set(0.1, 1.05, 0)
    dorsal.rotation.z = -0.35
    fish.add(dorsal)
    const pect = new THREE.Mesh(cone, mat(0x94a3b8))
    pect.scale.set(0.35, 0.7, 0.08)
    pect.position.set(-0.2, -0.25, 0.8)
    pect.rotation.set(0.3, 0, 2.2)
    fish.add(pect)
    const yellow = mat(0xfacc15)
    for (let i = 0; i < 3; i++) {
      for (const sgn of [1, -1]) {
        const f = new THREE.Mesh(cone, yellow)
        f.scale.set(0.12, 0.2, 0.05)
        f.position.set(0.85 + i * 0.22, sgn * (0.62 - i * 0.1), 0)
        if (sgn < 0) f.rotation.z = Math.PI
        fish.add(f)
      }
    }

    // 目（白目＋黒目＋ハイライト）。まばたきは group の縦スケール
    const eyes = []
    const white = mat(0xffffff, { metalness: 0 })
    const black = mat(0x0f172a, { metalness: 0, roughness: 0.2 })
    for (const z of [0.6, -0.6]) {
      const g = new THREE.Group()
      g.position.set(-1.05, 0.25, z)
      const w1 = new THREE.Mesh(sphere, white)
      w1.scale.setScalar(0.3)
      const p = new THREE.Mesh(sphere, black)
      p.scale.setScalar(0.16)
      p.position.set(-0.12, 0, Math.sign(z) * 0.18)
      const hl = new THREE.Mesh(sphere, white)
      hl.scale.setScalar(0.05)
      hl.position.set(-0.2, 0.07, Math.sign(z) * 0.3)
      g.add(w1, p, hl)
      fish.add(g)
      eyes.push(g)
    }
    // 口
    const mouth = new THREE.Mesh(sphere, mat(0x7f1d1d, { metalness: 0 }))
    mouth.position.set(-1.68, -0.15, 0)
    mouth.scale.set(0.16, 0.03, 0.32)
    fish.add(mouth)

    fish.rotation.y = -0.6
    fish.scale.setScalar(0.95)

    let raf
    const t0 = performance.now()
    const loop = (now) => {
      const t = (now - t0) / 1000
      const talking = talkingRef?.current
      fish.rotation.y = -0.6 + Math.sin(t * 0.8) * 0.18
      fish.rotation.z = Math.sin(t * 1.1) * 0.05
      fish.position.y = Math.sin(t * 1.5) * 0.1
      tail.rotation.y = Math.sin(t * (talking ? 7 : 3.5)) * 0.5
      const blink = t % 3.8 < 0.13 ? 0.1 : 1
      eyes.forEach((e) => (e.scale.y = blink))
      mouth.scale.y = 0.03 + mouthOpen(t, talking) * 0.2
      renderer.render(scene, camera)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const ro = new ResizeObserver(() => {
      ;[w, h] = size()
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    })
    ro.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      disposables.forEach((x) => x.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [talkingRef, onFail])

  if (failed) return <div className={`${className} flex items-center justify-center text-xs text-slate-400`}>この端末では 3D を表示できません</div>
  return <div ref={host} className={className} />
}
