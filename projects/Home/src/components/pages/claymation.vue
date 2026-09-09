<script setup>
</script>
<template>
    <div class="container">
        <div class="scroll">
            <h1 class="font-rhd-b font-orange title-size">Experimental Claymation-Style 3D animation</h1>
            <a class="font-cpo font-white heading-size" href="https://youtu.be/YSU37dCTgO0">Watch it!</a>
            <img src="/page_images/clamation/Shot 18_0000.png">
            <p class="font-rhd-r font-white text-size-l"> An experimental claymation-style 3D animation made with Cinema 4D and Octane Renderer. This short animated film 
                experiments the use of clay-style textures and materials to recreate a realistic looking claymation style. It also experiments the volume modeling and animating
                technic in Cinema 4D for the seamless deformation effects. The short film itself focuses on a plot with the theme of "energy cycle" and the technology development on earth, from the very first star
                emitting light to the development of nuclear power in the end.
            </p>
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