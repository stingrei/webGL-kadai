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
    clearColor: 0xffffff,
    width: window.innerWidth,
    height: window.innerHeight
  }

  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 1.0,
    position: new THREE.Vector3(1.0, 1.0, 1.0)
  }

  static AMBIENT_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 0.1
  }

  static MATERIAL_PARAM = {
    color: 0xffffff
  }

  static INTERSECTION_MATERIAL_PARAM = {
    color: 0x000000
  }

  static FOG_PARAM = {
    color: 0xffffff,
    near: 15.0,
    far: 25.0
  }

  wrapper;
  renderer;
  scene;
  camera;
  directionalLight;
  ambientLight;
  material;
  hitMaterial;
  torusGeometry;
  torusArray;
  texture;
  controls;
  axesHelper;
  isDown;
  group;
  raycaster;

  constructor(wrapper) {
    this.wrapper = wrapper;
    this.render = this.render.bind(this)

    this.raycaster = new THREE.Raycaster()

    window.addEventListener('click', (mouseEvent) => {
      const x = mouseEvent.clientX / window.innerWidth * 2.0 - 1
      const y = mouseEvent.clientY / window.innerHeight * 2.0 - 1
      const v = new THREE.Vector2(x, -y)
      this.raycaster.setFromCamera(v, this.camera)
      
      const intersects = this.raycaster.intersectObjects(this.torusArray)
      this.torusArray.forEach((mesh) => {
        mesh.material = this.material
      })
      if(intersects.length > 0){
        intersects[0].object.material = this.hitMaterial
      }
    }, false)

    window.addEventListener('keydown', (keyEvent) => {
      switch (keyEvent.key) {
        case ' ':
          this.isDown = true
          break
        default:
      }
    }, false)

    window.addEventListener('keyup', () => {
      this.isDown = false
    }, false)

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

    this.scene.fog = new THREE.Fog(
      ThreeApp.FOG_PARAM.color,
      ThreeApp.FOG_PARAM.near,
      ThreeApp.FOG_PARAM.far
    )

    this.camera = new THREE.PerspectiveCamera(
      ThreeApp.CAMERA_PARAM.fovy,
      ThreeApp.CAMERA_PARAM.aspect,
      ThreeApp.CAMERA_PARAM.near,
      ThreeApp.CAMERA_PARAM.far
    )
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position)
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt)

    this.directionalLight = new THREE.DirectionalLight(
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity
    )
    this.directionalLight.position.copy(ThreeApp.DIRECTIONAL_LIGHT_PARAM.position)
    this.scene.add(this.directionalLight)

    this.ambientLight = new THREE.AmbientLight(
      ThreeApp.AMBIENT_LIGHT_PARAM.color,
      ThreeApp.AMBIENT_LIGHT_PARAM.intensity
    )
    this.scene.add(this.ambientLight)

    this.material = new THREE.MeshPhongMaterial(ThreeApp.MATERIAL_PARAM)
    this.material.map = this.texture
    this.hitMaterial = new THREE.MeshPhongMaterial(ThreeApp.INTERSECTION_MATERIAL_PARAM)
    this.hitMaterial.map = this.texture

    this.group = new THREE.Group()
    this.scene.add(this.group)

    const torusCount = 10
    const transformScale = 5.0
    this.torusGeometry = new THREE.TorusGeometry(0.5, 0.2, 8, 16)
    this.torusArray = []
    for (let i = 0; i < torusCount; ++i) {
      const torus = new THREE.Mesh(this.torusGeometry, this.material)
      torus.position.x = (Math.random() * 2 - 1)*transformScale
      torus.position.y = (Math.random() * 2 - 1)*transformScale
      torus.position.z = (Math.random() * 2 - 1)*transformScale
      this.group.add(torus)
      this.torusArray.push(torus)
    } 

    const axesBarLength = 5
    this.axesHelper = new THREE.AxesHelper(axesBarLength)
    this.scene.add(this.axesHelper)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.isDown = false
  }

  load() {
    return new Promise((resolve) => {
      const imagePath = './sample.jpg'
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

    if(this.isDown) {
      this.group.rotation.y += 0.05
    }

    this.renderer.render(this.scene, this.camera)
  }
}