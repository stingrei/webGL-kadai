import * as THREE from '../lib/three.module.js';
import { OrbitControls } from "../lib/OrbitControls.js";


window.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('#webgl')
  const app = new ThreeApp(wrapper);
  app.render();
}, false)

class ThreeApp {
  static CAMERA_PARAM = {
    focvy: 80,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 20.0,
    position: new THREE.Vector3(7, 7, 7),
    lookAt: new THREE.Vector3(0, 0, 0),
  };

  static RENDERER_PARAM = {
    clearColor: 0x454b8c,
    width: window.innerWidth,
    height: window.innerHeight
  };

  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 1,
    position: new THREE.Vector3(5, 10, .5)
  }

  static POINT_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 15,
    distance: 0,
    decay: 2,
    position: new THREE.Vector3(10, 10, 0)
  }

  static AMBIENT_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: .3
  }

  static MATERIAL_PARAM = {
    color: 0xffffff
  };

  renderer;
  scene;
  camera;
  directionalLight;
  pointLight;
  ambientLight;
  boxGeometry;
  boxArray;
  material;
  box;
  controls;
  axesHelper;
  isDown;
  countX;
  countZ;
  rand;


  /**
   * コンストラクタ
   * @constructor
   * @param {HTMLElement} wrapper
   */
  constructor(wrapper) {
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);
    
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(color);
    this.renderer.setSize(ThreeApp.RENDERER_PARAM.width, ThreeApp.RENDERER_PARAM.height)

    wrapper.appendChild(this.renderer.domElement)

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(
      ThreeApp.CAMERA_PARAM.focvy,
      ThreeApp.CAMERA_PARAM.aspect,
      ThreeApp.CAMERA_PARAM.near,
      ThreeApp.CAMERA_PARAM.far,
    )
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position)
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt)

    // this.directionalLight = new THREE.DirectionalLight(
    //   ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
    //   ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity
    // )
    // this.directionalLight.position.copy(ThreeApp.DIRECTIONAL_LIGHT_PARAM.position)
    // this.scene.add(this.directionalLight)

    this.pointLight = new THREE.PointLight(
      ThreeApp.POINT_LIGHT_PARAM.color,
      ThreeApp.POINT_LIGHT_PARAM.intensity,
      ThreeApp.POINT_LIGHT_PARAM.distance,
      ThreeApp.POINT_LIGHT_PARAM.decay,
    )
    this.pointLight.position.copy(ThreeApp.POINT_LIGHT_PARAM.position)
    this.scene.add(this.pointLight)

    this.ambientLight = new THREE.AmbientLight(
      ThreeApp.AMBIENT_LIGHT_PARAM.color,
      ThreeApp.AMBIENT_LIGHT_PARAM.intensity
    )
    this.scene.add(this.ambientLight)

    // this.geometry = new THREE.BoxGeometry(1, 1, 1)
    this.material = new THREE.MeshPhongMaterial(ThreeApp.MATERIAL_PARAM)

    const boxCount = 100
    const transformScale = 2
    
    this.boxArray = []
    this.countX = -5
    this.countZ = -5
    for (let i = 0; i < boxCount; ++i) {
      this.rand = Math.random() * 5 + 1
      this.boxGeometry = new THREE.BoxGeometry(1, this.rand, 1)
      const box = new THREE.Mesh(this.boxGeometry, this.material)
      console.log(this.countX)
      box.position.x = this.countX
      box.position.y = 1/2*this.rand
      box.position.z = this.countZ

      this.scene.add(box)

      this.boxArray.push(box)
      this.countX++
      if (this.countX >= 5){
        this.countX = -5
        this.countZ++
      }
    }

    this.box = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.box)

    const axesBarLength = 5
    this.axesHelper = new THREE.AxesHelper(axesBarLength)
    // this.scene.add(this.axesHelper)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

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
    window.addEventListener('keyup', () => {
      this.isDown = false
    }, false)

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
    }, false)
  }


  /**
   * 描画処理
   */
  render() {
    requestAnimationFrame(this.render)
    this.controls.update()

    if(this.isDown) {
      this.pointLight.position.x -= .1
      if(this.pointLight.position.x < -10){
        this.pointLight.position.x = 10        
      }

    }
    this.renderer.render(this.scene, this.camera)
  }
}