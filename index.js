/* global THREE */

(function() {
  function BoxGroup() {
    THREE.Group.call(this);
    this.add(new Box());
    this.created = this.updated = Date.now();
  }

  BoxGroup.prototype = Object.create(THREE.Group.prototype);
  BoxGroup.prototype.constructor = BoxGroup;
  BoxGroup.prototype.update = function() {
    var time = Date.now();
    if (time - this.updated > 1000) {
      this.add(new Box());
      this.updated = time;
    }
    this.children.forEach(function(box) {
      box.update();
    });
  };

  function Box() {
    var colors = [0xff0000, 0xffff00, 0x00ff00, 0x00ffff];
    var geometry = new THREE.BoxBufferGeometry(
      Math.random() * 30 + 10,
      Math.random() * 30 + 10,
      Math.random() * 30 + 10
    );
    var material = new THREE.MeshBasicMaterial( {color: colors[Math.floor(Math.random() * colors.length)]} );
    THREE.Mesh.call(this, geometry, material);
  }

  Box.prototype = Object.create(THREE.Mesh.prototype);
  Box.prototype.constructor = Box;
  Box.prototype.update = function() {
    this.position.x += 1;
  };


  /* main */

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(25, 0, 100);
  camera.lookAt(new THREE.Vector3(0, 20, 20));
  var renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( 0xeeeeee );
  document.body.appendChild( renderer.domElement );

  var boxes = new BoxGroup();
  scene.add(boxes);

  function render() {
    requestAnimationFrame(render);
    boxes.update();
    renderer.render(scene, camera);
  }

  render();
})();
