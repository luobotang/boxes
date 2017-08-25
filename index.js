/* global THREE */

(function() {
  function BoxGroup() {
    THREE.Group.call(this);
    this.addBox();
    this.addBox();
    this.addBox();
    this.addBox();
    this.addBox();
    this.created = this.updated = Date.now();
  }

  BoxGroup.prototype = Object.create(THREE.Group.prototype);
  BoxGroup.prototype.constructor = BoxGroup;
  BoxGroup.prototype.update = function() {
    var time = Date.now();
    // add box per sencond
    if (time - this.updated > 1000) {
      this.addBox();
      this.updated = time;
    }
    this.children.forEach(function(box) {
      box.update();
    });
  };
  BoxGroup.prototype.addBox = function() {
    this.add(new Box());
  };

  function Box() {
    var geometry = this.getRandomGeometry(Math.random());
    var material = new THREE.MeshLambertMaterial( {color: Math.random() * 0xFFFFFF} );
    THREE.Mesh.call(this, geometry, material);
    this.position.x += (Math.random() - 0.5) * 100;
    this.position.y += (Math.random() - 0.5) * 100;
    this.position.z += (Math.random() - 0.5) * 100;
    this.rotation.x += (Math.random() - 0.5) * 10;
    this.rotation.y += (Math.random() - 0.5) * 10;
    this.rotation.z += (Math.random() - 0.5) * 10;
    this._mx = Math.random() > 0.8 ? 0 : (Math.random() - 0.5) * 2;
    this._my = Math.random() > 0.8 ? 0 : (Math.random() - 0.5) * 2;
    this._mz = Math.random() > 0.8 ? 0 : (Math.random() - 0.5) * 2;
    this._rx = Math.random() > 0.5 ? 0 : (Math.random() - 0.5) * 0.1;
    this._ry = Math.random() > 0.5 ? 0 : (Math.random() - 0.5) * 0.1;
    this._rz = Math.random() > 0.5 ? 0 : (Math.random() - 0.5) * 0.1;
  }

  Box.prototype = Object.create(THREE.Mesh.prototype);
  Box.prototype.constructor = Box;
  Box.prototype.update = function() {
    this.position.x += this._mx;
    this.position.y += this._my;
    this.position.z += this._mz;
    this.rotation.x += this._rx;
    this.rotation.y += this._ry;
    this.rotation.z += this._rz;
  };
  Box.prototype.getRandomGeometry = function(seed) {
    if (seed > 0.8) {
      return new THREE.BoxBufferGeometry(
        Math.random() * 20 + 10,
        Math.random() * 20 + 10,
        Math.random() * 20 + 10
      );
    }
    if (seed > 0.6) {
      return new THREE.IcosahedronBufferGeometry(
        Math.random() * 20 + 10
      );
    }
    if (seed > 0.4) {
      return new THREE.DodecahedronBufferGeometry(
        Math.random() * 20 + 10
      );
    }
    if (seed > 0.2) {
      return new THREE.TorusGeometry(
        Math.random() * 20 + 10,
        10,
        10,
        30
      );
    }
    return new THREE.TetrahedronBufferGeometry(
      Math.random() * 20 + 10
    );
  };


  /* main */

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 50, 200);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var lightDirect = new THREE.DirectionalLight(0xffffff, 0.5);
  lightDirect.target.position.x = 0.3;
  lightDirect.target.position.z = -0.3;
  scene.add( lightDirect );

  var lightAmbient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add( lightAmbient );

  var boxes = new BoxGroup();
  scene.add(boxes);

  var renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( 0xffffff );
  document.body.appendChild( renderer.domElement );

  function render() {
    requestAnimationFrame(render);
    boxes.update();
    renderer.render(scene, camera);
  }

  render();
})();
