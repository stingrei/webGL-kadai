import * as THREE from '../lib/three.module.js'
import {OrbitControls} from '../lib/OrbitControls.js'
import { GLTFLoader } from '../lib/GLTFLoader.js'

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
    intensity: 3.0,
    position: new THREE.Vector3(4.0, 4.0, 4.0)
  }

  static AMBIENT_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 0.1
  }

  static VINYL_JACKET_PARAM = {
    count: 10,
    size: 2
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

  static SHADOW_PARAM = {
    spaceSize: 10.0,
    mapSize: 2512
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
  textures = [];
  controls;
  axesHelper;
  isDown;
  group;
  raycaster;
  gltf;

  vinylArray = [];
  sleeveGroup;
  sleeveFront;
  sleeveBack
  vinyl;
  vinylTexture;
  hoverVinyl;
  clickVinyl;

  constructor(wrapper) {
    this.wrapper = wrapper;
    this.render = this.render.bind(this)

    this.raycaster = new THREE.Raycaster()

    window.addEventListener('mousemove', (mouseEvent) => {
      const x = mouseEvent.clientX / window.innerWidth * 2.0 - 1
      const y = mouseEvent.clientY / window.innerHeight * 2.0 - 1
      const v = new THREE.Vector2(x, -y)
      this.raycaster.setFromCamera(v, this.camera)
      
      const intersects = this.raycaster.intersectObjects(this.vinylArray)
      // this.vinylArray.forEach((mesh) => {
      //   mesh.position.y = 0
      // })
      if(intersects.length > 0){
        this.hoverVinyl = intersects[0].object
        document.querySelector('body').classList.add('hover')
      }else{
        this.hoverVinyl = ''
        document.querySelector('body').classList.remove('hover')
      }
    }, false)

    window.addEventListener('click', (mouseEvent) => {
      const x = mouseEvent.clientX / window.innerWidth * 2.0 - 1
      const y = mouseEvent.clientY / window.innerHeight * 2.0 - 1
      const v = new THREE.Vector2(x, -y)
      this.raycaster.setFromCamera(v, this.camera)
      
      const intersects = this.raycaster.intersectObjects(this.vinylArray)
      this.vinylArray.forEach((mesh) => {
        mesh.material = this.material
      })
      if(intersects.length > 0){
        this.clickVinyl = intersects[0].object
      }else{
        this.clickVinyl = ''
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

    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap

    this.scene = new THREE.Scene()

    // this.scene.fog = new THREE.Fog(
    //   ThreeApp.FOG_PARAM.color,
    //   ThreeApp.FOG_PARAM.near,
    //   ThreeApp.FOG_PARAM.far
    // )

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
    // this.scene.add(this.cameraHelper)

    this.ambientLight = new THREE.AmbientLight(
      ThreeApp.AMBIENT_LIGHT_PARAM.color,
      ThreeApp.AMBIENT_LIGHT_PARAM.intensity
    )
    this.scene.add(this.ambientLight)

    const jacketCount = ThreeApp.VINYL_JACKET_PARAM.count
    for (let i = 0; i < jacketCount; ++i) {
      const planeGeometry = new THREE.PlaneGeometry(ThreeApp.VINYL_JACKET_PARAM.size, ThreeApp.VINYL_JACKET_PARAM.size)
      const planeMaterial = new THREE.MeshPhongMaterial()
      planeMaterial.map = this.textures[i]
      this.sleeveFront = new THREE.Mesh(planeGeometry, planeMaterial)
      this.sleeveBack = new THREE.Mesh(planeGeometry, planeMaterial)

      this.sleeveGroup = new THREE.Group()
      this.sleeveGroup.add(this.sleeveFront)
      this.sleeveGroup.add(this.sleeveBack)
      this.sleeveBack.rotation.y = this.degreeToRadian(180)
      this.sleeveBack.position.z = -0.01
       
      this.sleeveFront.receiveShadow = true
      this.scene.add(this.sleeveGroup)

      // this.sleeveGroup.position.x = ThreeApp.VINYL_JACKET_PARAM.size / 2
      this.sleeveGroup.position.y = ThreeApp.VINYL_JACKET_PARAM.size / 2
      this.sleeveGroup.position.z = -i * ThreeApp.VINYL_JACKET_PARAM.size / 3.5 + 1

      this.sleeveGroup.traverse((object) => {
        if (object.isMesh === true || object.isSkinnedMesh === true) {
          object.castShadow = true
        }
      })
      this.sleeveGroup.vinylId = i

      this.vinylArray.push(this.sleeveGroup)
    }

    const planeGeometry = new THREE.PlaneGeometry(10, 10)
    const planeMaterial = new THREE.MeshPhongMaterial()
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial)
    this.plane.rotation.x = -Math.PI * 0.5
    this.plane.receiveShadow = true
    this.scene.add(this.plane)

    this.scene.add(this.gltf.scene);
    this.gltf.scene.scale.set(5, 5, 5)
    this.gltf.scene.position.z = 2
    this.gltf.scene.position.x = -1

    this.gltf.scene.traverse((object) => {
      if (object.isMesh === true || object.isSkinnedMesh === true) {
        object.castShadow = true
      }
    })

    const axesBarLength = 5
    this.axesHelper = new THREE.AxesHelper(axesBarLength)
    // this.scene.add(this.axesHelper)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.isDown = false
  }

  load() {
    return new Promise((resolve) => {
      const jacketCount = ThreeApp.VINYL_JACKET_PARAM.count
      for (let i = 0; i < jacketCount; ++i) {
        const imagePath = './jacket'+ i +'.jpg'
        const loader = new THREE.TextureLoader()
        loader.load(imagePath, (texture) => {
          this.textures[i] = texture
          if (i == jacketCount - 1){

            const imagePath = './vinyl.png'
            loader.load(imagePath, (texture) => {
              this.vinylTexture = texture

              const gltfPath = './record_player/scene.gltf'
              const loader = new GLTFLoader()
              loader.load(gltfPath, (gltf) => {
                this.gltf = gltf
                resolve()
              })
              
            })
            
          }
        })
      }
    })
  }

  degreeToRadian (degree) {
    return degree*(Math.PI/180)
  }

  render() {
    requestAnimationFrame(this.render)

    this.controls.update()

    if(this.isDown) {
      this.group.rotation.y += 0.05
    }
    if (this.clickVinyl) {
      if (this.clickVinyl.parent.position.x < ThreeApp.VINYL_JACKET_PARAM.size) {
        this.clickVinyl.parent.position.x += 0.1
      }
      if (!this.hoverVinyl) {
        for(let i = 0; i < this.vinylArray.length; ++i) {
          if (this.vinylArray[i].vinylId != this.clickVinyl.parent.vinylId) {
            if (this.vinylArray[i].position.x > 0) {
              this.vinylArray[i].position.x -= 0.1
            }
          }
        }
      }
    }else{
      for(let i = 0; i < this.vinylArray.length; ++i) {
        if (this.vinylArray[i].position.x > 0) {
          this.vinylArray[i].position.x -= 0.1
        }
      }
    }

    if (this.hoverVinyl) {
      if (this.hoverVinyl.parent.position.x < ThreeApp.VINYL_JACKET_PARAM.size/5) {
        this.hoverVinyl.parent.position.x += 0.1
      }
      for(let i = 0; i < this.vinylArray.length; ++i) {
        if (this.vinylArray[i].vinylId != this.hoverVinyl.parent.vinylId) {
          if (this.vinylArray[i].position.x > 0) {
            this.vinylArray[i].position.x -= 0.1
          }
        }
      }
    }else{
      for(let i = 0; i < this.vinylArray.length; ++i) {
        if (this.vinylArray[i].position.x > 0) {
          this.vinylArray[i].position.x -= 0.1
        }
      }
    }
    this.renderer.render(this.scene, this.camera)
  }
}