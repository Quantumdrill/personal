<script setup>

  import name from "./components/name.vue"
  import circleBG from "./components/circle.vue"
  

  let key1s = ["emotions","actions"]
  let kaomojis
  fetch("https://raw.githubusercontent.com/codingstark-dev/kaomoji/refs/heads/main/kaomoji.json").then(r=>r.json()).then(r=>{
    kaomojis=r
    let key1 = key1s[Math.floor(Math.random()*2)]
    let key2 = Object.keys(kaomojis[key1])[Math.floor(Math.random()*Object.keys(kaomojis[key1]).length)]
    let result = kaomojis[key1][key2][Math.floor(Math.random()*kaomojis[key1][key2].length)]
    document.title = "toby "+result
  })
  //credit: https://github.com/codingstark-dev/kaomoji



</script>

<template>
  <div id="bg" class="bg-orange">
    <name/>
    <circleBG/>
  </div>
</template>

<style scoped>
#bg {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}
</style>
