import * as THREE from '../lib/three.module.js'
import {OrbitControls} from '../lib/OrbitControls.js'
import {GLTFLoader} from '../lib/GLTFLoader.js'

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
    far: 1000.0,
    position: new THREE.Vector3(0.0, 50.0, 200.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  }

  static RENDERER_PARAM = {
    clearColor: 0xffffff,
    width: window.innerWidth,
    height: window.innerHeight,
  }

  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 1.0,
    position: new THREE.Vector3(1.0, 1.0, 1.0),
  }

  static AMBIENT_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 0.1,
  }

  static MATERIAL_PARAM = {
    color: 0xffffff,
  }

  static RENDER_TARGET_SIZE = 1024

  wrapper;
  renderer;
  scene;
  camera;
  directionalLight;
  ambientLight;
  controls;
  axesHelper;
  gltf;

  offscreenScene;
  offscreenCamera;
  plane;
  renderTarget;
  blackColor;
  whiteColor;


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

    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap

    this.scene = new THREE.Scene()

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

    this.directionalLight.castShadow = true

    this.directionalLight.shadow.camera.top    = ThreeApp.SHADOW_PARAM.spaceSize
    this.directionalLight.shadow.camera.bottom = -ThreeApp.SHADOW_PARAM.spaceSize
    this.directionalLight.shadow.camera.left   = -ThreeApp.SHADOW_PARAM.spaceSize
    this.directionalLight.shadow.camera.right  = ThreeApp.SHADOW_PARAM.spaceSize

    this.directionalLight.shadow.mapSize.width = ThreeApp.SHADOW_PARAM.mapSize
    this.directionalLight.shadow.mapSize.height = ThreeApp.SHADOW_PARAM.mapSize

    this.cameraHelper = new THREE.CameraHelper(this.directionalLight.shadow.camera)
    this.scene.add(this.cameraHelper)

    this.ambientLight = new THREE.AmbientLight(
      ThreeApp.AMBIENT_LIGHT_PARAM.color,
      ThreeApp.AMBIENT_LIGHT_PARAM.intensity
    )
    this.scene.add(this.ambientLight)

    this.scene.add(this.gltf.scene)

    this.gltf.scene.traverse((object) => {
      if (object.isMesh === true || object.isSkinnedMesh === true) {
        object.castShadow = true
      }
    })

    const planeGeometry = new THREE.PlaneGeometry(500, 500)
    const planeMaterial = new THREE.MeshPhongMaterial()
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial)
    this.plane.rotation.x = -Math.PI * 0.5

    this.plane.receiveShadow = true
    this.scene.add(this.plane)

    const axesBarLength = 5
    this.axesHelper = new THREE.AxesHelper(axesBarLength)
    this.scene.add(this.axesHelper)

    this.clock = new THREE.Clock()

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  }

  load() {
    return new Promise((resolve) => {
      const gltfPath = './Fox.glb'
      const loader = new GLTFLoader()

      loader.load(gltfPath, (gltf) => {
        this.gltf = gltf
        this.mixer = new THREE.AnimationMixer(this.gltf.scene)
        const animations = this.gltf.animations
        this.actions = []

        for(let i = 0; i < animations.length; ++i){
          this.actions.push(this.mixer.clipAction(animations[i]))
          this.actions[i].setLoop(THREE.loopRepeat)
          this.actions[i].play()
          this.actions[i].weight = 0
        }
        // this.actions[1].weight = .3;
        this.actions[0].weight = 1;
        this.actions[2].weight = 1;
        resolve()
      })
    })
  }

  render() {
    requestAnimationFrame(this.render)

    this.controls.update()

    const delta = this.clock.getDelta()
    this.mixer.update(delta)

    this.renderer.render(this.scene, this.camera)
  }
}