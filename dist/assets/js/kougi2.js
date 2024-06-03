import * as THREE from '../lib/three.module.js';
import { OrbitControls } from "../lib/OrbitControls.js";
import { EffectComposer } from "../lib/EffectComposer.js";
import { RenderPass } from "../lib/RenderPass.js";
import { GlitchPass } from "../lib/GlitchPass.js";
import { DotScreenPass } from '../lib/DotScreenPass.js';

window.addEventListener('DOMContentLoaded', async ()=>{
  const wrapper = document.querySelector('#webgl')
  const app = new ThreeApp(wrapper)

  await app.load()

  app.render()
}, false)


class ThreeApp {
  static CAMERA_PARAM = {
    fovy: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 20.0,
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
    intensiry: 0.1
  }

  static MATERIAL_PARAM = {
    color: 0xffffff,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  }

  static FOG_PARAM = {
    color: 0xffffff,
    near: 1.0,
    far: 15.0
  }

  renderer;
  scene;
  camera;
  directionalLight;
  ambientLight;
  material;
  torusGeometry;
  torusArray;
  planeArray;
  planeGeometry;
  controls;
  axesHelper;
  isDown;
  group;
  group2;
  composer;
  renderPass;
  glitchPass;
  dotScreenPass;

  constructor(wrapper) {
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor)
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setClearColor(color)
    this.renderer.setSize(ThreeApp.RENDERER_PARAM.width, ThreeApp.RENDERER_PARAM.height)
    wrapper.appendChild(this.renderer.domElement)
    
    this.scene = new THREE.Scene()

    // this.scene.fog = new THREE.Fog(
    //   ThreeApp.FOG_PARAM.color,
    //   ThreeApp.FOG_PARAM.near,
    //   ThreeApp.FOG_PARAM.far,
    // )

    // const cameraParameter = this.calcCameraParameter(ThreeApp.CAMERA_SCALE)
    this.camera = new THREE.PerspectiveCamera(
      ThreeApp.CAMERA_PARAM.fovy,
      ThreeApp.CAMERA_PARAM.aspect,
      ThreeApp.CAMERA_PARAM.near,
      ThreeApp.CAMERA_PARAM.far,
    )
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position)
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt)

    this.directionalLight = new THREE.DirectionalLight(
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity
    )
    this.directionalLight.position.copy(ThreeApp.DIRECTIONAL_LIGHT_PARAM.position)
    this.scene.add(this.directionalLight)

    this.material = new THREE.MeshPhongMaterial(ThreeApp.MATERIAL_PARAM)

    this.group = new THREE.Group()
    this.scene.add(this.group)

    this.group2 = new THREE.Group()
    this.scene.add(this.group2)


    const torusCount = 10
    const transformScale = 5.0
    this.torusGeometry = new THREE.TorusGeometry(0.5, 0.3, 8, 50)
    this.torusArray = []
    for (let i = 0; i < torusCount; ++i) {
      const torus = new THREE.Mesh(this.torusGeometry, this.material)
      torus.position.x = (Math.random() * 2.0 - 1.0) * transformScale
      torus.position.y = (Math.random() * 2.0 - 1.0) * transformScale
      torus.position.z = (Math.random() * 2.0 - 1.0) * transformScale
      this.group.add(torus)
      this.torusArray.push(torus)
    }

    const planeCount = 10
    this.planeGeometry = new THREE.PlaneGeometry(1.0, 1.0)
    this.planeArray = []
    for (let i = 0; i < planeCount; ++i){
      const plane = new THREE.Mesh(this.planeGeometry, this.material)


      plane.position.x = (Math.random() * 2.0 - 1.0) * transformScale
      plane.position.y = (Math.random() * 2.0 - 1.0) * transformScale
      plane.position.z = (Math.random() * 2.0 - 1.0) * transformScale
      this.group2.add(plane)
    }

    const axesBarLength = 5.0
    this.axesHelper = new THREE.AxesHelper(axesBarLength)
    this.scene.add(this.axesHelper)


    this.controls = new OrbitControls(this.camera, this.renderer.domElement)


    this.composer = new EffectComposer(this.renderer)
    this.renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(this.renderPass)
    this.glitchPass = new GlitchPass()
    this.composer.addPass(this.glitchPass)

    this.dotScreenPass = new DotScreenPass()
    this.composer.addPass(this.dotScreenPass)

    this.dotScreenPass.renderToScreen = true


    this.render = this.render.bind(this)

    this.isDown = false

    window.addEventListener('keydown', (keyEvent) => {
      switch (keyEvent.key) {
        case ' ':
          this.isDown = true
          break;
        default:
      }
    }, false)

    window.addEventListener('keyup', (keyEvent) => {
      this.isDown = false
    }, false)

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.camera.aspect = window.innerWidth / window.innerHeight

      this.camera.updateProjectionMatrix()
    }, false)


  }

  load() {
    return new Promise((resolve) => {
      const imagePath = './sample.jpg'
      const loader = new THREE.TextureLoader()
      loader.load(imagePath, (texture) =>{
        this.material.map = texture
        resolve()
      })

    })
  }

  render() {
    requestAnimationFrame(this.render)

    this.controls.update()

    

    if (this.isDown === true) {
      this.group.rotation.y += 0.05
      this.group2.rotation.y -= 0.05 
    }

    this.composer.render()
  }
}

