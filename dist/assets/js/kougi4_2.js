import * as THREE from '../lib/three.module.js'
import {OrbitControls} from '../lib/OrbitControls.js'

window.addEventListener('DOMContentLoaded', async () => {
  const wrapper = document.querySelector('#webgl')
  const app = new ThreeApp(wrapper)
  await app.load()
  app.init()
  app.render()
}, false)

class ThreeApp {

  static CAMERA_PARAM = {
    fovy: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 50.0,
    position: new THREE.Vector3(0.0, 2.0, 10.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0)
  }

  static RENDERER_PARAM = {
    clearColor: 0x000000,
    width: window.innerWidth,
    height: window.innerHeight
  }

  static MATERIAL_PARAM = {
    color: 0xffcc00,
    size: 0.5,
    sizeAttenuation: true,
    opacity: 0.8,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }

  wrapper;
  renderer;
  scene;
  camera;
  geometry;
  material;
  points;
  controls;
  axesHelper;
  texture;

  constructor(wrapper) {
    this.wrapper = wrapper;
    this.render = this.render.bind(this)

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
    }, false)
  }
  
  init() {
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor)
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setClearColor(color)
    this.renderer.setSize(ThreeApp.RENDERER_PARAM.width, ThreeApp.RENDERER_PARAM.height)
    this.wrapper.appendChild(this.renderer.domElement)

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(
      ThreeApp.CAMERA_PARAM.fovy,
      ThreeApp.CAMERA_PARAM.aspect,
      ThreeApp.CAMERA_PARAM.near,
      ThreeApp.CAMERA_PARAM.far
    )
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position)
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt)

    this.material = new THREE.PointsMaterial(ThreeApp.MATERIAL_PARAM)
    this.material.map = this.texture
    
    this.geometry = new THREE.BufferGeometry()
    const COUNT = 200
    const WIDTH = 10.0
    const vertices = []
    for (let i = 0; i <= COUNT; ++i) {
      // const x = (i / COUNT - 0.5) * WIDTH
      // for (let j = 0; j <= COUNT; ++j) {
      //   const y = (j / COUNT - 0.5)* WIDTH
      //   vertices.push(x, y, 0.0)
      //   console.log(x + ' : ' + y)
      // }
      vertices.push(
        Math.random() * WIDTH - (WIDTH * 0.5),
        Math.random() * WIDTH - (WIDTH * 0.5),
        Math.random() * WIDTH - (WIDTH * 0.5),
      )

    }
    const stride = 3
    const attribute = new THREE.BufferAttribute(new Float32Array(vertices), stride)
    this.geometry.setAttribute('position', attribute)

    this.points = new THREE.Points(this.geometry, this.material)
    this.scene.add(this.points)

    const axesBarLength = 5
    this.axesHelper = new THREE.AxesHelper(axesBarLength)
    this.scene.add(this.axesHelper)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  }

  load() {
    return new Promise((resolve) => {
      const imagePath = './star.png'
      const loader = new THREE.TextureLoader()
      loader.load(imagePath, (texture) => {
        this.texture = texture
        resolve()
      })
    })
  }

  render() {
    requestAnimationFrame(this.render)

    this.controls.update()

    this.renderer.render(this.scene, this.camera)
  }
}