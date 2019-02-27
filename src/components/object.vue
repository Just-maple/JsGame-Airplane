<template>
  <div :style="`
  top:${object.y-object.height/2}px;
  left:${object.x-object.width/2}px;
  height:${object.height}px;
  width:${object.width}px;};
  ${object.type===3?'background:linear-gradient(yellow,red,orange);border-radius:10px':''};
  ${object.type===6?`background:${object.color};border-radius:20px`:''};
  `"
       :key="object.type"
       style="position: absolute;" class="object">

    <img src="/static/media/cloud.png" style="z-index: 0;position: absolute" align="center"
         v-if="object.type===0"
         :width="object.width*5"/>

    <img src="/static/media/airplane.png" align="center" v-else-if="object.type===1"
         :width="object.width" style="transform: scale(1.5)"/>

    <div v-else-if="object.type===2">
      <div style="border: 1px solid;" v-if="object.hp !==object.score">
        <div style="height: 1px;float: left;background: red" :style="`width:${object.hp*100/object.score}%`"></div>
      </div>
      <img class="enemy" src="/static/media/enemy.png" style="transform: rotate(180deg) scale(1.5)" align="center"
           :width="object.width"/>
    </div>

    <img class="enemy" :src="`/static/media/boom.gif`"
         style="transform: rotate(180deg) scale(3)"
         align="center"
         v-else-if="object.type===4"
         :width="object.width"/>

    <img class="enemy" :src="`/static/media/boom2.gif`"
         style="transform: scale(4)"
         align="center"
         v-else-if="object.type===4.2"
         :width="object.width"/>

    <div v-else-if="object.type===6" style="color: #fff;" :style="`line-height: ${object.height}px`">
      {{object.name}}
    </div>
    <slot></slot>
  </div>
</template>

<script>
  import ap from './airplane'

  export default {
    name: "object",
    data() {
      return {
        color: {
          1: 'blue',
          2: 'red',
          3: 'green'
        },
        i: '',
        move_i: '',
        fpt: 50
      }
    },
    created() {
      this.move_i = setInterval(() => {
        this.object.y += this.object.speedY
        this.object.x += this.object.speedX
      }, 1000 / this.fpt)
      if (this.object.type === 2) {
        this.i = setInterval(this.enemyMove, 1000 / this.fpt)
      } else if (this.object.type === 3) {
        this.i = setInterval(this.bulletMove, 1000 / this.fpt)
      } else if (this.object.type === 0) {
        this.i = setInterval(this.cloudMove, 1000 / this.fpt)
      } else if (this.object.type === 6) {
        this.i = setInterval(this.toolMove, 1000 / this.fpt)
      }
    },
    destroyed() {
      clearInterval(this.i)
      clearInterval(this.move_i)
    },
    props: ['object', 'player', 'playGround', 'enemies'],
    methods: {
      enemyMove() {
        let enemy = this.object
        if (this.player.type === 1 && enemy.type === 2 && ap.objectCollision(this.object, this.player)) {
          enemy.type = 4

          this.player.type = 4.2
          this.$emit('crash')
          setTimeout(() => {
            enemy.type = 5
          }, 1000)
        }
      },
      toolMove() {
        if (this.player.type === 1 && ap.objectCollision(this.object, this.player)) {
          this.object.type = 5
          this.object.func()
          setTimeout(() => {
              navigator.vibrate && navigator.vibrate(100)
            }, 0
          )
        }
      },
      bulletMove() {
        for (let e of  this.enemies) {
          if (this.object.type === 3 && e.type === 2 && ap.objectCollision(this.object, e)) {
            this.object.type = 5;
            e.hp -= this.object.hp;
            if (e.hp <= 0) {
              this.$emit('atk', e)
            }
            break
          }
        }
      }
    }
  }
</script>

<style scoped>
  .object .enemy {
    transition: all .5s;
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
  }
</style>
