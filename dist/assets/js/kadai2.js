import * as THREE from '../lib/three.module.js';
import { OrbitControls } from "../lib/OrbitControls.js";



window.addEventListener('DOMContentLoaded', ()=>{
  const wrapper = document.querySelector('#webgl')
  const app = new ThreeApp(wrapper)
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
    clearColor: 0x666666,
    width: window.innerWidth,
    height: window.innerHeight
  }

  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 2.0,
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


  // 扇風機の定義のための定数
  static WING_PARAM = {
    radius: .7,
    segments: 5,
    thetaStart: 0,
    thetaLength: 0.6
  }
  static WING_MATERIAL_PARAM = {
    color: 0x4eabc2,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  }

  static HUB_PARAM = {
    radiusTop: .1,
    radiusBottom: .2,
    height: .2,
    radialSegment: 24,
    heightSegment: 8,
    openEnded: false,
    thetaStart: 0,
    thetaLength: 2*Math.PI
  }

  static MORTOR_PARAM = {
    radiusTop: .2,
    radiusBottom: .2,
    height: .4,
    radialSegment: 24,
    heightSegment: 8,
    openEnded: false,
    thetaStart: 0,
    thetaLength: 2*Math.PI
  }
  static SWITCH_PARAM = {
    radiusTop: .01,
    radiusBottom: .01,
    height: .06,
    radialSegment: 10,
    heightSegment: 8,
    openEnded: false,
    thetaStart: 0,
    thetaLength: 2*Math.PI
  }
  static SWITCH_CAP_PARAM = {
    radiusTop: .02,
    radiusBottom: .02,
    height: .02,
    radialSegment: 10,
    heightSegment: 8,
    openEnded: false,
    thetaStart: 0,
    thetaLength: 2*Math.PI
  }
  static NECK_PARAM = {
    radiusTop: .05,
    radiusBottom: .05,
    height: .8,
    radialSegment: 10,
    heightSegment: 8,
    openEnded: false,
    thetaStart: 0,
    thetaLength: 2*Math.PI
  }
  static FAN_BASE_PARAM = {
    radiusTop: .4,
    radiusBottom: .4,
    height: .05,
    radialSegment: 30,
    heightSegment: 8,
    openEnded: false,
    thetaStart: 0,
    thetaLength: 2*Math.PI
  }

  static FAN_BASIC_MATERIAL = {
    color: 0xeaedd8
  }

  static CLOCK_BASE_MATERIAL = {
    color: 0xffffff,
    transparent: false,
    opacity: 1,
    side: THREE.DoubleSide
  }

  static CLOCK_BASE_PARAM = {
    radius: 1,
    segments: 30,
    thetaStart: 0,
    thetaLength: 2*Math.PI
  }

  static CLOCK_HAND_MATERIAL = {
    color: 0x000000
  }

  static CLOCK_HOUR_HAND_PARAM = {
    width: 0.05,
    height: (0.45 + 0.1),
    widthSegment: 1,
    heightSegment: 1
  }
  static CLOCK_MINUTE_HAND_PARAM = {
    width: 0.03,
    height: (0.65 + 0.1),
    widthSegment: 1,
    heightSegment: 1
  }
  static CLOCK_SECOND_HAND_PARAM = {
    width: .01,
    height: (0.65 + 0.1),
    widthSegment: 1,
    heightSegment: 1
  }

  static CLOCK_MARK_PARAM = {
    width: .02,
    height: 0.05,
    widthSegment: 1,
    heightSegment: 1
  }

  static CLOCK_MARK_PARAM2 = {
    width: .02,
    height: 0.12,
    widthSegment: 1,
    heightSegment: 1
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
  wingGeometry;
  wingMaterial;
  fanHubGeometry;
  wingGroup;
  fanBasicMaterial;
  motorGeometry;
  headSwitchGeometry;
  headSwitchCapGeometry;
  neckGeometry;
  headGroup;
  headRotateDirectionPlus;
  fanBaseGeometry;
  fanGroup;

  // clock
  clockBaseGeometry;
  hourHandGeometry;
  minuteHandGeometry;
  secondHandGeometry;
  numberGeometry;
  hourHandGroup;
  minuteHandGroup;
  secondHandGroup;
  clockGroup;
  markGeometry;
  markGroup;
  fiveMinutesMarkGeometry;
  fiveMinutesMarkGroup;
  


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

    this.wingGroup = new THREE.Group()

    this.headGroup = new THREE.Group()
    this.headGroup.add(this.wingGroup)
    
    
    this.fanGroup = new THREE.Group()
    this.fanGroup.add(this.headGroup)
    this.scene.add(this.fanGroup)
    // this.group2 = new THREE.Group()
    // this.scene.add(this.group2)
    
    const wingCount = 3
    for (let i = 0; i < wingCount; ++i) {
      this.wingGeometry = new THREE.CircleGeometry(
        ThreeApp.WING_PARAM.radius,
        ThreeApp.WING_PARAM.segments,
        ThreeApp.WING_PARAM.thetaStart,
        ThreeApp.WING_PARAM.thetaLength,
      )
      this.wingMaterial = new THREE.MeshPhongMaterial(ThreeApp.WING_MATERIAL_PARAM)
      const wing = new THREE.Mesh(this.wingGeometry, this.wingMaterial)
      // wing.rotation.x = 0.3
      console.log(this.degreeToRadian(360))
      wing.rotation.z = i*this.degreeToRadian(120)
      this.wingGroup.add(wing)
    }
    this.fanHubGeometry = new THREE.CylinderGeometry(
      ThreeApp.HUB_PARAM.radiusTop,
      ThreeApp.HUB_PARAM.radiusBottom,
      ThreeApp.HUB_PARAM.height,
      ThreeApp.HUB_PARAM.radialSegment,
      ThreeApp.HUB_PARAM.heightSegment,
      ThreeApp.HUB_PARAM.openEnded,
      ThreeApp.HUB_PARAM.thetaStart,
      ThreeApp.HUB_PARAM.thetaLength
    )
    this.fanBasicMaterial = new THREE.MeshPhongMaterial(ThreeApp.FAN_BASIC_MATERIAL)
    const hub = new THREE.Mesh(this.fanHubGeometry, this.fanBasicMaterial)
    hub.rotation.x = this.degreeToRadian(90)
    this.wingGroup.add(hub)
    this.wingGroup.position.z = .3

    this.motorGeometry = new THREE.CylinderGeometry(
      ThreeApp.MORTOR_PARAM.radiusTop,
      ThreeApp.MORTOR_PARAM.radiusBottom,
      ThreeApp.MORTOR_PARAM.height,
      ThreeApp.MORTOR_PARAM.radialSegment,
      ThreeApp.MORTOR_PARAM.heightSegment,
      ThreeApp.MORTOR_PARAM.openEnded,
      ThreeApp.MORTOR_PARAM.thetaStart,
      ThreeApp.MORTOR_PARAM.thetaLength
    )
    const motor = new THREE.Mesh(this.motorGeometry, this.fanBasicMaterial)
    motor.rotation.x = this.degreeToRadian(90)
    this.headGroup.add(motor)
    this.headRotateDirectionPlus = true

    this.headSwitchGeometry = new THREE.CylinderGeometry(
      ThreeApp.SWITCH_PARAM.radiusTop,
      ThreeApp.SWITCH_PARAM.radiusBottom,
      ThreeApp.SWITCH_PARAM.height,
      ThreeApp.SWITCH_PARAM.radialSegment,
      ThreeApp.SWITCH_PARAM.heightSegment,
      ThreeApp.SWITCH_PARAM.openEnded,
      ThreeApp.SWITCH_PARAM.thetaStart,
      ThreeApp.SWITCH_PARAM.thetaLength
    )
    const headSwitch = new THREE.Mesh(this.headSwitchGeometry, this.fanBasicMaterial)
    headSwitch.rotation.x = this.degreeToRadian(0)
    headSwitch.position.y = .2
    this.headGroup.add(headSwitch)

    this.headSwitchCapGeometry = new THREE.CylinderGeometry(
      ThreeApp.SWITCH_CAP_PARAM.radiusTop,
      ThreeApp.SWITCH_CAP_PARAM.radiusBottom,
      ThreeApp.SWITCH_CAP_PARAM.height,
      ThreeApp.SWITCH_CAP_PARAM.radialSegment,
      ThreeApp.SWITCH_CAP_PARAM.heightSegment,
      ThreeApp.SWITCH_CAP_PARAM.openEnded,
      ThreeApp.SWITCH_CAP_PARAM.thetaStart,
      ThreeApp.SWITCH_CAP_PARAM.thetaLength
    )
    const headSwitchCap = new THREE.Mesh(this.headSwitchCapGeometry, this.fanBasicMaterial)
    headSwitchCap.rotation.x = this.degreeToRadian(0)
    headSwitchCap.position.y = .23
    this.headGroup.add(headSwitchCap)

    this.neckGeometry = new THREE.CylinderGeometry(
      ThreeApp.NECK_PARAM.radiusTop,
      ThreeApp.NECK_PARAM.radiusBottom,
      ThreeApp.NECK_PARAM.height,
      ThreeApp.NECK_PARAM.radialSegment,
      ThreeApp.NECK_PARAM.heightSegment,
      ThreeApp.NECK_PARAM.openEnded,
      ThreeApp.NECK_PARAM.thetaStart,
      ThreeApp.NECK_PARAM.thetaLength
    )
    const neck = new THREE.Mesh(this.neckGeometry, this.fanBasicMaterial)
    neck.rotation.x = this.degreeToRadian(0)
    neck.position.y = -.6
    this.fanGroup.add(neck)

    this.fanBaseGeometry = new THREE.CylinderGeometry(
      ThreeApp.FAN_BASE_PARAM.radiusTop,
      ThreeApp.FAN_BASE_PARAM.radiusBottom,
      ThreeApp.FAN_BASE_PARAM.height,
      ThreeApp.FAN_BASE_PARAM.radialSegment,
      ThreeApp.FAN_BASE_PARAM.heightSegment,
      ThreeApp.FAN_BASE_PARAM.openEnded,
      ThreeApp.FAN_BASE_PARAM.thetaStart,
      ThreeApp.FAN_BASE_PARAM.thetaLength
    )
    const base = new THREE.Mesh(this.fanBaseGeometry, this.fanBasicMaterial)
    base.rotation.x = this.degreeToRadian(0)
    base.position.y = -1
    this.fanGroup.position.y = 1
    this.fanGroup.position.x = 1
    this.fanGroup.add(base)

    

    // clock
    this.clockGroup = new THREE.Group()
    this.hourHandGroup = new THREE.Group()
    this.minuteHandGroup = new THREE.Group()
    this.secondHandGroup = new THREE.Group()


    this.clockGroup.add(this.hourHandGroup)
    this.clockGroup.add(this.minuteHandGroup)
    this.clockGroup.add(this.secondHandGroup)
    this.scene.add(this.clockGroup)

    this.clockBaseGeometry = new THREE.CircleGeometry(
      ThreeApp.CLOCK_BASE_PARAM.radius,
      ThreeApp.CLOCK_BASE_PARAM.segments,
      ThreeApp.CLOCK_BASE_PARAM.thetaStart,
      ThreeApp.CLOCK_BASE_PARAM.thetaLength
    )
    this.clockBaseMaterial = new THREE.MeshPhongMaterial(ThreeApp.CLOCK_BASE_MATERIAL)
    const clockBase = new THREE.Mesh(this.clockBaseGeometry, this.clockBaseMaterial)
    this.clockGroup.add(clockBase)

    this.hourHandGeometry = new THREE.PlaneGeometry(
      ThreeApp.CLOCK_HOUR_HAND_PARAM.width,
      ThreeApp.CLOCK_HOUR_HAND_PARAM.height,
      ThreeApp.CLOCK_HOUR_HAND_PARAM.widthSegment,
      ThreeApp.CLOCK_HOUR_HAND_PARAM.heightSegment
    )
    this.clockHandMaterial = new THREE.MeshPhongMaterial(ThreeApp.CLOCK_HAND_MATERIAL)
    const hourHand = new THREE.Mesh(this.hourHandGeometry, this.clockHandMaterial)
    hourHand.position.z = .001
    hourHand.position.y = (ThreeApp.CLOCK_HOUR_HAND_PARAM.height - 0.1)/2
    this.hourHandGroup.add(hourHand)

    this.minuteHandGeometry = new THREE.PlaneGeometry(
      ThreeApp.CLOCK_MINUTE_HAND_PARAM.width,
      ThreeApp.CLOCK_MINUTE_HAND_PARAM.height,
      ThreeApp.CLOCK_MINUTE_HAND_PARAM.widthSegment,
      ThreeApp.CLOCK_MINUTE_HAND_PARAM.heightSegment
    )
    const minuteHand = new THREE.Mesh(this.minuteHandGeometry, this.clockHandMaterial)
    minuteHand.position.z = .001
    minuteHand.position.y = (ThreeApp.CLOCK_MINUTE_HAND_PARAM.height - 0.1)/2
    this.minuteHandGroup.add(minuteHand)

    this.secondHandGeometry = new THREE.PlaneGeometry(
      ThreeApp.CLOCK_SECOND_HAND_PARAM.width,
      ThreeApp.CLOCK_SECOND_HAND_PARAM.height,
      ThreeApp.CLOCK_SECOND_HAND_PARAM.widthSegment,
      ThreeApp.CLOCK_SECOND_HAND_PARAM.heightSegment
    )
    const secondHand = new THREE.Mesh(this.secondHandGeometry, this.clockHandMaterial)
    secondHand.position.z = .001
    secondHand.position.y = (ThreeApp.CLOCK_SECOND_HAND_PARAM.height - 0.1)/2
    this.secondHandGroup.add(secondHand)

    this.markGeometry = new THREE.PlaneGeometry(
      ThreeApp.CLOCK_MARK_PARAM.width,
      ThreeApp.CLOCK_MARK_PARAM.height,
      ThreeApp.CLOCK_MARK_PARAM.widthSegment,
      ThreeApp.CLOCK_MARK_PARAM.heightSegment
    )
    const markCount = 60
    for (let i = 0; i < markCount; ++i){
      this.markGroup = new THREE.Group()
      const mark = new THREE.Mesh(this.markGeometry, this.clockHandMaterial)
      mark.position.z = 0.001
      mark.position.y = 0.9
      this.markGroup.add(mark)
      this.markGroup.rotation.z = this.degreeToRadian(i * (360/60))

      this.clockGroup.add(this.markGroup)
    }

    this.fiuveMinutesMarkGeometry = new THREE.PlaneGeometry(
      ThreeApp.CLOCK_MARK_PARAM2.width,
      ThreeApp.CLOCK_MARK_PARAM2.height,
      ThreeApp.CLOCK_MARK_PARAM2.widthSegment,
      ThreeApp.CLOCK_MARK_PARAM2.heightSegment
    )
    const fiveMinuteMarkCount = 12
    for (let i = 0; i < fiveMinuteMarkCount; ++i){
      this.fiveMinutesMarkGroup = new THREE.Group()
      const mark = new THREE.Mesh(this.fiuveMinutesMarkGeometry, this.clockHandMaterial)
      mark.position.z = 0.001
      mark.position.y = 0.87
      this.fiveMinutesMarkGroup.add(mark)
      this.fiveMinutesMarkGroup.rotation.z = this.degreeToRadian(i * (360/12))

      this.clockGroup.add(this.fiveMinutesMarkGroup)
    }

    this.clockGroup.position.x = -1
    this.clockGroup.position.y = 1
    


    



    // const axesBarLength = 5.0
    // this.axesHelper = new THREE.AxesHelper(axesBarLength)
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

    window.addEventListener('keyup', (keyEvent) => {
      this.isDown = false
    }, false)

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.camera.aspect = window.innerWidth / window.innerHeight

      this.camera.updateProjectionMatrix()
    }, false)
  }

  render() {
    requestAnimationFrame(this.render)

    this.controls.update()

    if (!this.isDown){
      this.wingGroup.rotation.z += 0.3 

      if(this.headRotateDirectionPlus){
        this.headGroup.rotation.y += 0.01
      }else{
        this.headGroup.rotation.y -= 0.01
      }
      if(this.headGroup.rotation.y > this.degreeToRadian(90)){
        this.headRotateDirectionPlus = false
      }
      if(this.headGroup.rotation.y < this.degreeToRadian(-90)){
        this.headRotateDirectionPlus = true
      }
    }

    // clock
    let d = new Date()
    this.secondHandGroup.rotation.z = this.degreeToRadian(-6 * d.getSeconds())
    this.minuteHandGroup.rotation.z = this.degreeToRadian(-6 * d.getMinutes() - 0.1*d.getSeconds())
    let hour = d.getHours()
    if(hour > 13){
      hour = hour - 12
    }
    this.hourHandGroup.rotation.z = this.degreeToRadian(-30 * hour - ((30/60) * d.getMinutes()) - ((30/(60*60))*d.getSeconds()))
    console.log(hour)
    

    this.renderer.render(this.scene, this.camera)
  }

  degreeToRadian (degree) {
    return degree*(Math.PI/180)
  }
}

