import * as THREE from '../lib/three.module.js'
import { OrbitControls } from '../lib/OrbitControls.js'

window.addEventListener('DOMContentLoaded', async () => {
  const wrapper = document.querySelector('#webgl')
  const app = new ThreeApp(wrapper)
  await app.load()

  app.init()
  app.render()
}, false)

class ThreeApp {
  static MOON_SCALE = 0.27
  static MOON_DISTANCE = 3.0
  static SATELLITE_SPEED = 0.05
  static SATTELITE_TURN_SCALE = 0.1
  static CAMERA_PARAM = {
    fovy: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 50,
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
    intensity: 0.3
  }
  static MATERIAL_PARAM = {
    color: 0xffffff,
  }
  static FOG_PARAM = {
    color: 0xffffff,
    near: 10.0,
    far: 20.0
  }

  wrapper;
  renderer;
  scene;
  camera;
  directionalLight;
  ambientLight;
  controls;
  axesHelper;
  isDown;
  clock;
  sphereGeometry;
  earth;
  earthMaterial;
  earthTexture;
  moon;
  moonMaterial;
  moonTexture;
  satellite;
  satelliteMaterial;
  satelliteDirection;

  constructor(wrapper) {
    this.wrapper = wrapper
    this.render = this.render.bind(this)
    
    window.addEventListener('keydown', (keyEvent) => {
      switch (keyEvent.key) {
        case ' ':
          this.isDown = true
          break;
        default:
      }
    }, false)

    window.addEventListener('keyup', (keyEvent) => {
      this.isDown = false;
    }, false)

    window.addEventListener('pointermove', (pointerEvent) => {
      const pointerX = pointerEvent.clientX
      const pointerY = pointerEvent.clientY

      const scaleX = pointerX / window.innerWidth * 2 - 1
      const scaleY = pointerY / window.innerHeight * 2 - 1
      
      const vector = new THREE.Vector2(
        scaleX,
        scaleY
      )
      vector.normalize()

      this.moon.position.set(
        vector.x * ThreeApp.MOON_DISTANCE,
        0,
        vector.y * ThreeApp.MOON_DISTANCE
      )
    }, false)

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.camera.aspect = window.innerWidth / window/innerHeight
      this.camera.updateProjectionMatrix()
    }, false)

  }


  load() {
    return new Promise((resolve) => {
      const earthPath = './earth.jpg'
      const moonPath = './moon.jpg'
      const loader = new THREE.TextureLoader()
      loader.load(earthPath, (earthTexture)=>{
        this.earthTexture = earthTexture
        loader.load(moonPath, (moonTexture) => {
          this.moonTexture = moonTexture
          resolve()
        })
      })
    })
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

    this.sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32)
    this.earthMaterial = new THREE.MeshPhongMaterial(ThreeApp.MATERIAL_PARAM)
    this.earthMaterial.map = this.earthTexture
    this.earth = new THREE.Mesh(this.sphereGeometry, this.earthMaterial)
    this.scene.add(this.earth)

    this.moonMaterial = new THREE.MeshPhongMaterial(ThreeApp.MATERIAL_PARAM)
    this.moonMaterial.map = this.moonTexture
    this.moon = new THREE.Mesh(this.sphereGeometry, this.moonMaterial)
    this.scene.add(this.moon)

    this.moon.scale.setScalar(ThreeApp.MOON_SCALE)
    this.moon.position.set(ThreeApp.MOON_DISTANCE, 0.0, 0.0)

    this.satelliteMaterial = new THREE.MeshPhongMaterial({color: 0xff00dd})
    this.satellite = new THREE.Mesh(this.sphereGeometry, this.satelliteMaterial)
    this.scene.add(this.satellite)
    this.satellite.scale.setScalar(0.1)
    this.satellite.position.set(0.0, 0.0, ThreeApp.MOON_DISTANCE)
    this.satelliteDirection = new THREE.Vector3(0.0, 0.0, 1.0).normalize()

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    const axesBarLength = 5.0
    this.axesHelper = new THREE.AxesHelper(axesBarLength)
    this.scene.add(this.axesHelper)

    this.isDown = false

    this.clock = new THREE.Clock()
  }

  render() {
    requestAnimationFrame(this.render)

    this.controls.update()

    if (this.isDown === true) {
      this.earth.rotation.y += 0.05
      this.moon.rotation.y += 0.05
    }

    // const time = this.clock.getElapsedTime()
    // const sin = Math.sin(time)
    // const cos = Math.cos(time)

    // this.moon.position.set(
    //   cos * ThreeApp.MOON_DISTANCE,
    //   0.0,
    //   sin * ThreeApp.MOON_DISTANCE
    // )

    const subVector = new THREE.Vector3().subVectors(this.moon.position, this.satellite.position)
    subVector.normalize()
    this.satelliteDirection.add(subVector.multiplyScalar(ThreeApp.SATTELITE_TURN_SCALE))
    this.satelliteDirection.normalize()
    const direction = this.satelliteDirection.clone()
    this.satellite.position.add(direction.multiplyScalar(ThreeApp.SATELLITE_SPEED))


    this.renderer.render(this.scene, this.camera)
  }
}


