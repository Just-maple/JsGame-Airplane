<template>
  <div :style="`
  top:${airplane.y-airplane.height/2}px;
  left:${airplane.x-airplane.width/2}px;
  height:${airplane.height}px;
  width:${airplane.width}px;};
  ${airplane.type===3?'background:linear-gradient(yellow,red,orange);border-radius:10px':''};
  ${airplane.type===6?`background:${airplane.color};border-radius:20px`:''};
  `"
       :key="airplane.type"
       style="position: absolute;" class="airplane">

    <img src="/static/media/cloud.png" style="z-index: 0;position: absolute" align="center"
         v-if="airplane.type===0"
         :width="airplane.width*5"/>

    <img src="/static/media/airplane.png" align="center" v-else-if="airplane.type===1"
         :width="airplane.width" style="transform: scale(1.5)"/>

    <div v-else-if="airplane.type===2">
      <div style="border: 1px solid;" v-if="airplane.hp !==airplane.score">
        <div style="height: 1px;float: left;background: red" :style="`width:${airplane.hp*100/airplane.score}%`"></div>
      </div>
      <img class="enemy" src="/static/media/enemy.png" style="transform: rotate(180deg) scale(1.5)" align="center"
           :width="airplane.width"/>
    </div>

    <img class="enemy" :src="`/static/media/boom.gif`"
         style="transform: rotate(180deg) scale(3)"
         align="center"
         v-else-if="airplane.type===4"
         :width="airplane.width"/>

    <img class="enemy" :src="`/static/media/boom2.gif`"
         style="transform: scale(4)"
         align="center"
         v-else-if="airplane.type===4.2"
         :width="airplane.width"/>

    <div v-else-if="airplane.type===6" style="color: #fff;" :style="`line-height: ${airplane.height}px`">
      {{airplane.name}}
    </div>
    <slot></slot>
  </div>
</template>

<script>
  import ap from './airplane'

  export default {
    name: "airplane",
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
        this.airplane.y += this.airplane.speedY
        this.airplane.x += this.airplane.speedX
      }, 1000 / this.fpt)
      if (this.airplane.type === 2) {
        this.i = setInterval(this.enemyMove, 1000 / this.fpt)
      } else if (this.airplane.type === 3) {
        this.i = setInterval(this.bulletMove, 1000 / this.fpt)
      } else if (this.airplane.type === 0) {
        this.i = setInterval(this.cloudMove, 1000 / this.fpt)
      } else if (this.airplane.type === 6) {
        this.i = setInterval(this.toolMove, 1000 / this.fpt)
      }
    },
    destroyed() {
      clearInterval(this.i)
      clearInterval(this.move_i)
    },
    props: ['airplane', 'player', 'playGround', 'enemies'],
    methods: {
      enemyMove() {
        let enemy = this.airplane
        if (this.player.type === 1 && enemy.type === 2 && ap.objectCollision(this.airplane, this.player)) {
          enemy.type = 4

          this.player.type = 4.2
          this.$emit('crash')
          setTimeout(() => {
            enemy.type = 5
          }, 1000)
        }
      },
      toolMove() {
        if (this.player.type === 1 && ap.objectCollision(this.airplane, this.player)) {
          this.airplane.type = 5
          this.airplane.func()
          setTimeout(() => {
              navigator.vibrate && navigator.vibrate(100)
            }, 0
          )
        }
      },
      bulletMove() {
        for (let e of  this.enemies) {
          if (this.airplane.type === 3 && e.type === 2 && ap.objectCollision(this.airplane, e)) {
            this.airplane.type = 5;
            e.hp -= this.airplane.hp;
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
  .airplane .enemy {
    transition: all .5s;
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
  }
</style>
