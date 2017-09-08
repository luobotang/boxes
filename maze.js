/* global THREE */

(function() {
  var mazeData = [
    // startX, startY, endX, endY
    0, 0, 10, 0,
    10, 0, 10, 3,
    10, 4, 10, 10,
    0, 10, 10, 10,
    0, 0, 0, 4,
    0, 5, 0, 10,
    2, 0, 2, 1,
    4, 0, 4, 3,
    6, 0, 6, 4,
    8, 0, 8, 1,
    8, 1, 9, 1,
    1, 9, 1, 10,
    0, 4, 2, 4,
    1, 1, 1, 3,
    1, 2, 2, 2,
    1, 3, 3, 3,
    1, 4, 1, 5,
    1, 5, 3, 5,
    3, 1, 3, 5,
    3, 4, 4, 4,
    5, 1, 5, 6,
    4, 5, 5, 5,
    5, 6, 8, 6,
    5, 4, 8, 4,
    8, 4, 8, 2,
    7, 1, 7, 3,
    7, 2, 9, 2,
    8, 1, 9, 1,
    9, 3, 10, 3,
    6, 5, 9, 5,
    9, 5, 9, 3,
    9, 6, 10, 6,
    9, 9, 10, 9,
    0, 6, 1, 6,
    2, 6, 4, 6,
    2, 6, 2, 7,
    1, 7, 3, 7,
    0, 8, 4, 8,
    2, 8, 2, 9,
    3, 9, 4, 9,
    4, 6, 4, 9,
    4, 7, 5, 7,
    5, 7, 5, 9,
    6, 9, 6, 6,
    7, 7, 7, 10,
    8, 6, 8, 7,
    8, 7, 9, 7,
    9, 7, 9, 8,
    8, 8, 9, 8,
    8, 8, 8, 9
  ];
  var Keys = {
    A: 97,
    D: 100,
    F: 102,
    G: 103,
    M: 109,
    S: 115,
    P: 112,
    W: 119
  };

  function drawMaze(data, scene) {
    var walls = toWalls(data);
    var groupWalls = new THREE.Group();
    var groupFrame = new THREE.Group();
    walls.forEach(function(wall) {
      groupWalls.add(wall.solid);
      groupFrame.add(wall.frame);
    });
    return {
      walls: groupWalls,
      frame: groupFrame
    };
  }

  function toWalls(data) {
    var i = 0;
    var len = data.length;
    var walls = [];
    var materialSolid = new THREE.MeshLambertMaterial( {color: 0xcccccc} );
    var materialFrame = new THREE.LineBasicMaterial( {color: 0xcc9999} );
    while (i < len) {
      walls.push(createWall(data[i], data[i + 1], data[i + 2], data[i+ 3], materialSolid, materialFrame));
      i += 4;
    }
    return walls;
  }

  function createWall(x1, y1, x2, y2, materialSolid, materialFrame) {
    var horizontal = y1 === y2;
    var long;
    var width;
    var x;
    var y;
    if (horizontal) {
      long = Math.abs(x2 - x1);
      width = 0;
      x = Math.min(x1, x2) + (long / 2);
      y = y1;
    } else {
      long = 0;
      width = Math.abs(y2 - y1);
      x = x1;
      y = Math.min(y1, y2) + (width / 2);
    }
    var WALL_WIDTH = 0.1;
    var geometry = new THREE.BoxBufferGeometry(long + WALL_WIDTH, width + WALL_WIDTH, 2);

    var frame = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), materialFrame);
    frame.material.depthTest = false;
    frame.material.opacity = 0.25;
    frame.material.transparent = true;
    frame.position.x = x;
    frame.position.y = y;
    frame.position.z = 1;

    var solid = new THREE.Mesh(geometry, materialSolid);
    solid.position.x = x;
    solid.position.y = y;
    solid.position.z = 1;

    return {frame: frame, solid: solid};
  }

  function initScene() {
    var scene = new THREE.Scene();
    var lightAmbient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add( lightAmbient );
    return scene;
  }

  function initCamera() {
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.up = new THREE.Vector3(0, 0, 1);
    return camera;
  }

  function initRenderer() {
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0xffffff );
    document.body.appendChild( renderer.domElement );
    return renderer;
  }

  function Controler(options) {
    this.options = options;
    this.maze = options.maze;
    this.maze.data = options.mazeData;
    this.scene = options.scene;
    this.camera = options.camera;
    this.renderer = options.renderer;
    this.state = options.state || {};

    this.initPosition();
    this.addPoint();
    this.addLight();
    this.addPanel();
    this.update();
    this.render();
  }


  Controler.prototype.initPosition = function() {
    this.position = {
      x: -0.5,
      y: 4.5,
      z: 0.6
    };
    this.direction = {
      x: 0.2,
      y: 0
    };
    this.directionIndex = 0;
    this.directions = [
      [0.2, 0], [0.173, 0.1], [0.1, 0.173],
      [0, 0.2], [-0.1, 0.173], [-0.173, 0.1],
      [-0.2, 0], [-0.173, -0.1], [-0.1, -0.173],
      [0, -0.2], [0.1, -0.173], [0.173, -0.1]
    ];
  };

  Controler.prototype.addPoint = function() {
    var point = new THREE.Mesh(
      new THREE.BoxBufferGeometry(0.3, 0.3, 0.3),
      new THREE.MeshLambertMaterial({color: 0xff0000})
    );
    this.scene.add(point);
    this.point = point;

    // entry
    var entry = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 10, 10),
      new THREE.MeshBasicMaterial({color: 0xff0000})
    );
    entry.position.set(-1, 4.5, 1);

    // exit
    var exit = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 10, 10),
      new THREE.MeshBasicMaterial({color: 0x0000ff})
    );
    exit.position.set(11, 3.5, 1);

    this.scene.add(entry);
    this.scene.add(exit);
  };

  Controler.prototype.addPanel = function() {
    this.panel = document.createElement('div');
    this.panel.id = 'panel';
    document.body.appendChild(this.panel);
  };

  Controler.prototype.addLight = function() {
    this.light = new THREE.PointLight(0xffffff);
    this.light.distance = 5;
    this.light.up = new THREE.Vector3(0, 0, 1);
    this.scene.add(this.light);
  };

  Controler.prototype.initEvents = function() {
    var ctrl = this;

    document.addEventListener('keypress', function(e) {
      var keyCode = e.keyCode;
      if (keyCode === Keys.W) {
        ctrl.goForward();
      } else if (keyCode === Keys.A) {
        ctrl.moveLeft();
      } else if (keyCode === Keys.D) {
        ctrl.moveRight();
      } else if (keyCode === Keys.S) {
        ctrl.goBack();
      } else if (keyCode === Keys.P) {
        ctrl.togglePreview();
        ctrl.render();
        return;
      } else if (keyCode === Keys.G) {
        ctrl.toggleGrid();
        ctrl.render();
        return;
      } else if (keyCode === Keys.F) {
        ctrl.toggleFrame();
        ctrl.render();
        return;
      } else if (keyCode === Keys.M) {
        ctrl.toggleMouseMove();
      }
      ctrl.update();
      ctrl.render();
    }, false);

    if (ctrl.options.mouseMove) {
      var onmousemove = function(e) {
        ctrl.updateDirectionWithMouseMove(e.movementX, e.movementY);
      };
      document.addEventListener('pointerlockchange', function() {
        if (document.pointerLockElement === ctrl.renderer.domElement) {
          document.addEventListener('mousemove', onmousemove);
        } else {
          document.removeEventListener('mousemove', onmousemove);
        }
      }, false);

      this._startMouseMove();
    }
  };

  Controler.prototype.toggleGrid = function() {
    if (this.state.grid) {
      this.state.grid = false;
      this.removeGrid();
    } else {
      this.state.grid = true;
      this.addGrid();
    }
  };

  Controler.prototype.toggleFrame = function() {
    if (this.state.frame) {
      this.state.frame = false;
      this.scene.remove(this.maze.frame);
      this.scene.add(this.maze.walls);
    } else {
      this.state.frame = true;
      this.scene.remove(this.maze.walls);
      this.scene.add(this.maze.frame);
    }
  };

  Controler.prototype.addGrid = function() {
    if (this.grid) {
      this.scene.add(this.grid);
      return;
    }
    var group = new THREE.Group();
    var material = new THREE.LineBasicMaterial({color: 0xccccff});
    for (var i = 0, geometry; i <= 10; i++) {
      geometry = new THREE.Geometry();
      geometry.vertices.push(
        new THREE.Vector3(0, i, 0 ),
        new THREE.Vector3(10, i, 0)
      );
      group.add(new THREE.Line(geometry, material));
      geometry = new THREE.Geometry();
      geometry.vertices.push(
        new THREE.Vector3(i, 0, 0 ),
        new THREE.Vector3(i, 10, 0)
      );
      group.add(new THREE.Line(geometry, material));
    }
    this.grid = group;
    this.scene.add(this.grid);
  };
  Controler.prototype.removeGrid = function() {
    this.scene.remove(this.grid);
  };

  Controler.prototype.goForward = function() {
    var direction = this.getDirection('forward');
    this.moveDirection(direction);
  };
  Controler.prototype.goBack = function() {
    var direction = this.getDirection('back');
    this.moveDirection(direction);
  };

  Controler.prototype.moveLeft = function() {
    var direction = this.getDirection('left');
    this.moveDirection(direction);
  };
  Controler.prototype.moveRight = function() {
    var direction = this.getDirection('right');
    this.moveDirection(direction);
  };

  Controler.prototype.getDirection = function(desc) {
    var directionCount = this.directions.length;
    var currentIndex = this.directionIndex;
    var targetIndex;
    if (desc === 'left') {
      targetIndex = (currentIndex + directionCount / 4) % directionCount;
    } else if (desc === 'right') {
      targetIndex = (currentIndex + directionCount - directionCount / 4) % directionCount;
    } else if (desc === 'back') {
      targetIndex = (currentIndex + directionCount / 2) % directionCount;
    } else {
      targetIndex = currentIndex;
    }
    return this.directions[targetIndex];
  };

  Controler.prototype.moveDirection = function(direction) {
    var currentX = this.position.x;
    var currentY = this.position.y;
    if (this.isThroughWall(
      currentX, currentY,
      currentX + direction[0] * 3, currentY + direction[1] * 3
    )) {
      return;
    }
    this.position.x = currentX + direction[0];
    this.position.y = currentY + direction[1];
  };

  Controler.prototype.turnLeft = function() {
    this.directionIndex = (this.directionIndex + 1) % this.directions.length;
    var direction = this.directions[this.directionIndex];
    this.direction.x = direction[0];
    this.direction.y = direction[1];
  };
  Controler.prototype.turnRight = function() {
    this.directionIndex = (this.directionIndex + this.directions.length - 1) % this.directions.length;
    var direction = this.directions[this.directionIndex];
    this.direction.x = direction[0];
    this.direction.y = direction[1];
  };

  Controler.prototype.isThroughWall = function(x1, y1, x2, y2) {
    var i = 0;
    var data = this.maze.data;
    var len = data.length;
    while (i < len) {
      if (checkLineSegmentCross(x1, y1, x2, y2, data[i], data[i + 1], data[i + 2], data[i + 3])) {
        return true;
      }
      i += 4;
    }
    return false;
  };

  Controler.prototype.update = function() {
    var position = this.position;
    var direction = this.direction;
    var directionTarget = new THREE.Vector3(
      position.x + direction.x,
      position.y + direction.y,
      position.z
    );

    this.camera.position.set(position.x, position.y, position.z);
    this.camera.lookAt(directionTarget);

    var point = this.point;
    point.position.x = position.x;
    point.position.y = position.y;
    point.position.z = position.z;

    // direction line
    if (this.directionLine) {
      this.scene.remove(this.directionLine);
    }
    var directionLineGeometry = new THREE.Geometry();
    directionLineGeometry.vertices.push(
      new THREE.Vector3(position.x, position.y, 0.2 ),
      new THREE.Vector3(position.x + direction.x * 5, position.y + direction.y * 5, 0.2)
    );
    this.directionLine = new THREE.Line(directionLineGeometry, new THREE.LineBasicMaterial({color: 0x00ff00}));
    this.scene.add(this.directionLine);

    // move light
    this.light.position.set(position.x, position.y, position.z);
    this.light.lookAt(directionTarget);

    this.panel.innerHTML = (
      'position: (' + position.x.toFixed(1) + ', ' + position.y.toFixed(1) + ') ' +
      'direction: (' + direction.x.toFixed(1) + ', ' + direction.y.toFixed(1) + ')'
    );
  };

  Controler.prototype.render = function() {
    this.renderer.render(this.scene, this.camera);
  };

  Controler.prototype.togglePreview = function() {
    if (this.state.preview) {
      this.state.preview = false;
      this.update();
    } else {
      this.state.preview = true;
      this.camera.position.set(5, 5, 20);
      this.camera.lookAt(new THREE.Vector3(5, 5, 0));
    }
  };

  Controler.prototype.toggleMouseMove = function() {
    if (this.state.mouseMove) {
      this._stopMouseMove();
    } else {
      this._startMouseMove();
    }
  };

  Controler.prototype._startMouseMove = function() {
    this.state.mouseMove = true;
    this.renderer.domElement.requestPointerLock();
    this.debug('start capture mouse move');
  };

  Controler.prototype._stopMouseMove = function() {
    this.state.mouseMove = false;
    document.exitPointerLock();
    this.debug('stop capture mouse move');
  };

  Controler.prototype.updateDirectionWithMouseMove = function(movementX, movementY) {
    var ctrl = this;
    this._movementX = (this._movementX || 0) + movementX;
    if (this._movementX > 50) {
      this.debug('trun right, movement: %s', this._movementX);
      this.turnRight(this._movementX);
      this._movementX = 0;
      if (!ctrl._nextAnimation) {
        ctrl._nextAnimation = requestAnimationFrame(function() {
          ctrl._nextAnimation = null;
          ctrl.update();
          ctrl.render();
        });
      }
    } else if (this._movementX < -50) {
      this.debug('trun left, movement: %s', this._movementX);
      this.turnLeft(this._movementX);
      this._movementX = 0;
      if (!ctrl._nextAnimation) {
        ctrl._nextAnimation = requestAnimationFrame(function() {
          ctrl._nextAnimation = null;
          ctrl.update();
          ctrl.render();
        });
      }
    }
  };


  Controler.prototype.debug = function(message) {
    if (this.options.debug) {
      var args = [].slice.call(arguments, 1); // eslint-disable-line prefer-rest-params
      var i = 0;
      // eslint-disable-next-line no-console
      console.log('[maze] ' + message.replace(/%s/g, function(m) {
        return args[i++];
      }));
    }
  };

  var scene = initScene();
  var camera = initCamera();
  var maze = drawMaze(mazeData, scene);

  scene.add(maze.walls);

  var controler = new Controler({
    scene: scene,
    maze: maze,
    mazeData: mazeData,
    camera: camera,
    renderer: initRenderer(),
    debug: true,
    mouseMove: true
  });

  document.getElementById('mask').onclick = function() {
    this.style.display = 'none';
    controler.initEvents();
  };

  /* eslint-disable camelcase */
  function checkLineSegmentCross(
    line1_x1, line1_y1, line1_x2, line1_y2,
    line2_x1, line2_y1, line2_x2, line2_y2
  ) {
    return (
      isDiff(
        crossProduct(line1_x2 - line1_x1, line1_y2 - line1_y1, line2_x1 - line1_x1, line2_y1 - line1_y1),
        crossProduct(line1_x2 - line1_x1, line1_y2 - line1_y1, line2_x2 - line1_x1, line2_y2 - line1_y1)
      ) && isDiff(
        crossProduct(line2_x2 - line2_x1, line2_y2 - line2_y1, line1_x1 - line2_x1, line1_y1 - line2_y1),
        crossProduct(line2_x2 - line2_x1, line2_y2 - line2_y1, line1_x2 - line2_x1, line1_y2 - line2_y1)
      )
    );
  }
  /* eslin-enable camelcase */

  // http://www.cnblogs.com/Duahanlang/archive/2013/05/11/3073434.html
  function crossProduct(x1, y1, x2, y2) {
    return x1 * y2 - x2 * y1;
  }

  function isDiff(m, n) {
    if (m > 0) return n < 0;
    if (m === 0) return false;
    if (m < 0) return n > 0;
  }
})();
