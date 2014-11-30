var THREE = require('../lib/three/three.js');

var velocities;

var particleMaterial = require('../materials/particle.js');


function HexBoson (container, poolSize, poolCount, enabled){

  this.enabled = enabled;

  this.peakPoolsUsed = 0;

  this.pools = [];
  var length = poolSize;
  velocities = new Float32Array(length * 2);
  var a = ((Math.PI * 2) / length), x, y;

  for (var i = 0; i < length; i++){

    //var v = new THREE.Vector2(x, y).multiplyScalar(speed);
    var o = Math.random() * Math.PI * 2;
    x = Math.sin(o);
    y = Math.cos(o);

    velocities[(i * 2) + 0] = x;
    velocities[(i * 2) + 1] = y;

  }

  var positions = new Float32Array(poolSize * poolCount * 3);
  var colours = new Float32Array(poolSize * poolCount * 3);
  var size = new Float32Array(poolSize * poolCount);
  var active = new Float32Array(poolSize * poolCount);

  for (var i = 0; i < poolCount; i++){

    this.pools.push({
      Id : i,
      length : poolSize,
      first : (poolSize * i),
      last : (poolSize * i) + poolSize,
      useCount : 0

    });

  }

  var toggle = true;

  for (var i = 0; i < poolSize * poolCount; i++){
    positions[i * 3 + 0] = 0;//-20 + (Math.random() * 40);
    positions[i * 3 + 1] = 0;//-20 + (Math.random() * 40);
    positions[i * 3 + 2] = 0.5;
    colours[i * 3 + 0] = 0;
    colours[i * 3 + 1] = 0.5;
    colours[i * 3 + 2] = 1; 
    size[i] = 1.5;
    active[i] = 2;
    toggle != toggle;
    
  }

  this.geo = new THREE.BufferGeometry();

  this.geo.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  this.geo.addAttribute('size', new THREE.BufferAttribute(size, 1));
  this.geo.addAttribute('customColor', new THREE.BufferAttribute(colours, 3));
  this.geo.addAttribute('active', new THREE.BufferAttribute(active, 1));

  this.system = new THREE.PointCloud(this.geo, particleMaterial);

  console.log('created system');

  this.poolSize = poolSize;
  this.poolCount = poolCount;

  //this.contactSparks(tick.now, new THREE.Vector3(-5, 5, 0.5), 5, 1, false, 1, false);
  //if (this.enabled){
    container.add(this.system);
 // }

  //this.enabled = false;

}

//var length = 10;

    
var entId = 0;

HexBoson.prototype = {

  contactSparks : function (now, origin, lifespan, speed ){

    if (!this.enabled){
      return new DestroyImmediately();
    }

    var pool = this.pools.shift();
    pool.inUse = ++entId;
    pool.useCount++;


    var first = pool.first;
    var last = pool.last;
    var length = pool.length;

    var pools = this.pools;

    var x = origin.x;
    var y = origin.y;

    //last = pool.first + length;
    
    var positions = this.system.geometry.attributes.position.array;
    var colours = this.system.geometry.attributes.customColor.array;
    var active = this.system.geometry.attributes.active.array;

    var geo = this.geo;

    this.start = now;
    //this.lifespan = lifespan;


    //for (var i = first; i < last; i++){
    //  active[i] = 0;
    //}
    //geo.attributes.active.needsUpdate = true;

    var poolsUsed = (function (){
      var used = this.poolCount - this.pools.length;
      if (used > this.peakPoolsUsed){
        this.peakPoolsUsed = used;
        console.log('peak pool use', used);
      }
    }).bind(this);

    var entity = new ParticleEntity(pool.inUse, now, function (now){


      var progress = now - this.start;
      var alpha = progress / lifespan;

      if (!this.destroyed){

        if (alpha > 1 && !this.complete){

          this.complete = true;

        } else {

          var k;
          for (var i = first, /* j = Math.floor(Math.random() * length) */ j = 0; i < last; i++, j++){
            k = j % length;
            positions[i * 3 + 0] = (x + (velocities[k * 2 + 0] * (speed * alpha * (Math.random() * 0.2))));
            positions[i * 3 + 1] = (y + (velocities[k * 2 + 1] * (speed * alpha * (Math.random() * 0.2))))
            positions[i * 3 + 2] = 0.5;

            colours[i * 3 + 0] = 0;
            colours[i * 3 + 1] = 0.6 - (alpha * 0.6)
            colours[i * 3 + 2] = 1 - alpha

            active[i] = 0;

            //if ((positions[i * 3 + 0] > -0.1 && positions[i * 3 + 0] < 0.1) && (positions[i * 3 + 1] > -0.1 && positions[i * 3 + 1] < 0.1)){
            //  debugger;
            //}
          }
          geo.attributes.customColor.needsUpdate = true;
          geo.attributes.position.needsUpdate = true;
          geo.attributes.active.needsUpdate = true;
        //positions.needsUpdate = true;

        }

      }


    }, function (){

      if (pool.inUse === this.id){

        for (var i = first; i < last; i++ ){
          positions[i * 3 + 0] = 0;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = 0.5;
          active[i] = 1;
        }
        geo.attributes.position.needsUpdate = true;
        geo.attributes.active.needsUpdate = true;
        pools.unshift(pool);  
        pool.inUse = false;
      }

    });

    return entity;
    

  },

  linearSparks : function (now, origin, lifespan, speed ){

    if (!this.enabled){
      return new DestroyImmediately();
    }

    var pool = this.pools.shift();
    pool.inUse = ++entId;
    pool.useCount++;


    var first = pool.first;
    var last = pool.last;
    var length = pool.length;

    var pools = this.pools;

    var x = origin.x;
    var y = origin.y;

    //last = pool.first + length;
    
    var positions = this.system.geometry.attributes.position.array;
    var colours = this.system.geometry.attributes.customColor.array;
    var active = this.system.geometry.attributes.active.array;

    var geo = this.geo;

    this.start = now;
    //this.lifespan = lifespan;


    //for (var i = first; i < last; i++){
    //  active[i] = 0;
    //}
    //geo.attributes.active.needsUpdate = true;

    var poolsUsed = (function (){
      var used = this.poolCount - this.pools.length;
      if (used > this.peakPoolsUsed){
        this.peakPoolsUsed = used;
        console.log('peak pool use', used);
      }
    }).bind(this);

    var entity = new ParticleEntity(pool.inUse, now, function (now){

      var progress = now - this.start;
      var alpha = progress / lifespan;

      if (!this.destroyed){

        if (alpha > 1 && !this.complete){

          this.complete = true;

        } else {

          var k;
          for (var i = first, /* j = Math.floor(Math.random() * length) */ j = 0; i < last; i++, j++){
            k = j % length;
            positions[i * 3 + 0] = (x + (velocities[k * 2 + 0] * (speed * alpha )));
            positions[i * 3 + 1] = (y + (velocities[k * 2 + 1] * (speed * alpha )))
            positions[i * 3 + 2] = 0.5;

            colours[i * 3 + 0] = 0;
            colours[i * 3 + 1] = 0.6 - (alpha * 0.6)
            colours[i * 3 + 2] = 1 - alpha

            active[i] = 0;

            //if ((positions[i * 3 + 0] > -0.1 && positions[i * 3 + 0] < 0.1) && (positions[i * 3 + 1] > -0.1 && positions[i * 3 + 1] < 0.1)){
            //  debugger;
            //}
          }
          geo.attributes.customColor.needsUpdate = true;
          geo.attributes.position.needsUpdate = true;
          geo.attributes.active.needsUpdate = true;
        //positions.needsUpdate = true;

        }

      } else {

        console.warn('particle entity updater called despite being destroyed!!');

      }


    }, function (){

      if (pool.inUse === this.id){

        for (var i = first; i < last; i++ ){
          positions[i * 3 + 0] = 0;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = 0.5;
          active[i] = 1;
        }
        geo.attributes.position.needsUpdate = true;
        geo.attributes.active.needsUpdate = true;
        pools.unshift(pool);  
        pool.inUse = false;
      }

    });

    return entity;
    

  },

  zoneSplode : function (now, poolCount, direction, lifespan, speed ){

    if (!this.enabled){
      return new DestroyImmediately();
    }

    var localPools = [], pool, pools = this.pools, poolSize = this.poolSize;

    if (!poolCount){

      poolCount = 10;

    }

    var id = ++entId;

    // get a bunch of pools..
    for (var i = 0; i < poolCount; i ++){

      pool = this.pools.shift();
      pool.inUse = id;
      pool.useCount++;
      localPools.push(pool);

    }

    var directions = new Float32Array(poolCount * this.poolSize * 2);

    // get references to the attributes...
    var positions = this.system.geometry.attributes.position.array;
    var colours = this.system.geometry.attributes.customColor.array;
    var active = this.system.geometry.attributes.active.array;
    var size = this.system.geometry.attributes.size.array;
    var geo = this.geo;

    // iterate through each pool, setting initial 
    var j = 0;

    var r,g,b;

    if (direction === -1){
      r = 0x8f / 0xff;
      g = 0xfd / 0xff;
      b = 0x93 / 0xff;// 0x8FFD93
      
    } else {
      r = 0xff / 0xff;
      g = 0xd2 / 0xff;
      b = 0xff / 0xff;// 0x8FFD93
    }

    localPools.forEach(function (pool){

      var first = pool.first;
      var last = pool.last;
      var length = pool.length;
      var o, x, y, offset;

      for (var i = first, k = 0; i < last; i++, k ++){

        offset = ((j * poolSize) + k);
        o = Math.random() * (direction === -1 ? -Math.PI : Math.PI);
        directions[offset * 2 + 0] = x = Math.sin(o);
        directions[offset * 2 + 1] = y = Math.cos(o);
        positions[i * 3 + 0] = x * 11;
        positions[i * 3 + 1] = y * 11;
        positions[i * 3 + 2] = 0.5;
        active[i] = 0;
        //size[i] = 5;
        colours[i * 3 + 0] = r;
        colours[i * 3 + 1] = g;
        colours[i * 3 + 2] = b;


      }

      j++;

    });

    geo.attributes.position.needsUpdate = true;
    geo.attributes.customColor.needsUpdate = true;
    //geo.attributes.size.needsUpdate = true;
    geo.attributes.active.needsUpdate = true;


    this.start = now;
    //this.lifespan = lifespan;

    var entity = new ParticleEntity(id, now, function (now){

      var progress = now - this.start;
      var alpha = progress / lifespan;

      if (!this.destroyed){

        if (alpha > 1 && !this.complete){

          this.complete = true;
          
        } else {

          var j = 0;

          localPools.forEach((function (pool){

            var first = pool.first;
            var last = pool.last;
            var length = pool.length;
            var offset, x, y;



              for (var i = first, k = 0; i < last; i++, k++){

                offset = ((j * poolSize) + k);

                x = directions[offset * 2 + 0];
                y = directions[offset * 2 + 1]

                positions[i * 3 + 0] += x * speed * (Math.random() * 0.2);
                positions[i * 3 + 1] += y * speed * (Math.random() * 0.2);
                positions[i * 3 + 2] = 0.5;


                colours[i * 3 + 0] = r *  (1 - alpha);
                colours[i * 3 + 1] = g *  (1 - alpha);
                colours[i * 3 + 2] = b *  (1 - alpha);

              }

              geo.attributes.position.needsUpdate = true;
              geo.attributes.customColor.needsUpdate = true;

              j ++;


          }).bind(this));

        }

      }


    }, function (){

        localPools.forEach((function (pool){

          var first = pool.first;
          var last = pool.last;
          var length = pool.length;

          if (pool.inUse === this.id){

            for (var i = first; i < last; i++ ){
              positions[i * 3 + 0] = 0;
              positions[i * 3 + 1] = 0;
              positions[i * 3 + 2] = 0.5;
              active[i] = 1;
            }
            geo.attributes.position.needsUpdate = true;
            geo.attributes.active.needsUpdate = true;
            pools.unshift(pool);  
            pool.inUse = false;

          }

        }).bind(this));


    });

    return entity;
    

  },

  explosion : function (now, origin, size, count, speed, color, lifespan){


  }

}

function DestroyImmediately (){
  this.complete = true;
  return this;
}

DestroyImmediately.prototype = {
  update : function (){

  },
  destroy : function (){

  }
}

// basic shell entity that just has a consistent enough API to be slotted into the game engine..
function ParticleEntity (entId, now, update, teardown){

  this.fnUpdate = update;
  this.fnTeardown = teardown;
  this.isExplosion = true;
  this.distance = 1000;
  this.id = entId;
  this.start = now;

}

ParticleEntity.prototype = {

  update : function (now){

    this.fnUpdate.call(this, now);

  },

  destroy : function (){
    if (!this.destroyed){
      this.fnTeardown.call(this);
      // destroy references to callbacks..
      this.fnUpdate = null;
      this.fnTeardown = null;
      this.destroyed = true;
    } else {
      console.warn('particle entity destroy called despite already being destroyed!!')
    }
    
    return this;

  }

}

module.exports.HexBoson = HexBoson;