<script setup>
</script>
<template>
    <div class="container">
        <div class="scroll">
            <h1 class="font-rhd-b font-orange title-size">THREE.JS Pointy Finger</h1>
            <a class="font-cpo font-white heading-size" href="https://pointyfinger.netlify.app/">Try it!</a>
            <img src="/page_images/pointyFinger/cover.png">
            <p class="font-rhd-r font-white text-size-l"> For the final of the Three.js For Makers course, I want to play with rigged characters in ThreeJS. By rigged characters I don’t mean just importing a skinned character and play the baked animation, but dynamically interacting with different parts of the body. This function is usually achieved by using an IK system. So one of the main challenge in this project is to figure out how to use an IK system in ThreeJS.
        The original idea was to find an IK library, and let it do everything for me. The first library I found was a library called THREE.IK. Sounds legit but this library has not been maintained for several years and a lot of the dependency functions it’s using don’t work anymore along the update of ThreeJS in the recent years, and this library never worked for me. So I turned to the native IK system of ThreeJS, slightly different logic but similar results.
        However, this IK system is far from complete, since this is designed for a long chain of joints instead of the more commonly used three-joint rotate-plane ik, with a pole vector to control the pole orientation. I’ve searched a lot of other libraries, and none of them have the functions I want. In the end, I decided to write this system myself.
        The majority of this documentation are methods and functions I used to solve this technical problem</p>
        </div>
    </div>
    
</template>
<style scoped>
*{
    box-sizing: border-box;
    padding: 30px 0;
}

.container {
    height: 100vh;
    width: 60vw;
    position: fixed;
    margin: auto;
    position: relative;
    overflow: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none
}


img {
    width: 100%;
    object-fit: fill;
}

.title-size {
    font-size: 60px;
}

p {
    line-height: 160%;
}
</style>