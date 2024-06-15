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
  static EARTH_SCALE = 3
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
  satellite;
  satelliteMaterial;
  satelliteDirection;
  goalPosition;

  constructor(wrapper) {
    this.wrapper = wrapper
    this.render = this.render.bind(this)
    
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.camera.aspect = window.innerWidth / window/innerHeight
      this.camera.updateProjectionMatrix()
    }, false)

    document.querySelectorAll('.button').forEach((button) => {
      button.addEventListener('click', ()=>{
        const lat = parseFloat(button.getAttribute('data-latitude'))
        const longi = parseFloat(button.getAttribute('data-longitude'))
        document.querySelector('.button.current').classList.remove('current')
        button.classList.add('current')
        this.goalPosition = this.calcGoal(lat, longi)
      })
    })

  }


  load() {
    return new Promise((resolve) => {
      const earthPath = './earth.jpg'
      const moonPath = './moon.jpg'
      const loader = new THREE.TextureLoader()
      loader.load(earthPath, (earthTexture)=>{
        this.earthTexture = earthTexture
        resolve()
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

    this.sphereGeometry = new THREE.SphereGeometry(ThreeApp.EARTH_SCALE, 32, 32)
    this.earthMaterial = new THREE.MeshPhongMaterial(ThreeApp.MATERIAL_PARAM)
    this.earthMaterial.map = this.earthTexture
    this.earth = new THREE.Mesh(this.sphereGeometry, this.earthMaterial)
    this.scene.add(this.earth)
    
    this.satelliteMaterial = new THREE.MeshPhongMaterial({color: 0xffffff})
    this.satellite = new THREE.Mesh(this.sphereGeometry, this.satelliteMaterial)
    this.scene.add(this.satellite)
    this.satellite.scale.setScalar(0.03)
    this.satellite.position.set(0, 0, ThreeApp.EARTH_SCALE)
    // this.satelliteDirection = new THREE.Vector3(0.0, 0.0, 1.0).normalize()

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    const axesBarLength = 5.0
    this.axesHelper = new THREE.AxesHelper(axesBarLength)
    // this.scene.add(this.axesHelper)

    this.isDown = false

    this.clock = new THREE.Clock()

    this.goalPosition = this.calcGoal(35.68, -139.83)
  }

  render() {
    requestAnimationFrame(this.render)

    // this.controls.update()

    const subVector = new THREE.Vector3().subVectors(this.goalPosition, this.satellite.position)
    subVector.normalize()

    // this.satellite.position.add(subVector.multiplyScalar(ThreeApp.SATELLITE_SPEED));

    var targetPosition = this.satellite.position.clone().add(subVector.multiplyScalar(ThreeApp.SATELLITE_SPEED));
    targetPosition.normalize()
    targetPosition.multiplyScalar(ThreeApp.EARTH_SCALE)
    

    if(Math.abs(this.goalPosition.x - this.satellite.position.x) > .05 || Math.abs(this.goalPosition.y - this.satellite.position.y) > .05  || Math.abs(this.goalPosition.z - this.satellite.position.z) > .05  ) {
      this.satellite.position.set(targetPosition.x, targetPosition.y, targetPosition.z)
      this.camera.position.copy(targetPosition.clone().multiplyScalar(ThreeApp.EARTH_SCALE))
      this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt)
    }

    this.renderer.render(this.scene, this.camera)
  }

  calcGoal(lat, long) {
    const y = Math.sin(this.degreeToRadian(lat))
    const x = Math.cos(this.degreeToRadian(long))*Math.cos(this.degreeToRadian(lat))
    const z = Math.sin(this.degreeToRadian(long))*Math.cos(this.degreeToRadian(lat))
    return new THREE.Vector3(x, y, z).normalize().multiplyScalar(ThreeApp.EARTH_SCALE)
  }
  degreeToRadian (degree) {
    return degree*(Math.PI/180)
  }
}


