<script setup>
</script>
<template>
    <div class="container">
        <div class="scroll">
            <h1 class="font-rhd-b font-orange title-size">Character Modeling & Rendering</h1>
            <a class="font-cpo font-white heading-size" href="https://www.youtube.com/watch?v=FPyO6wtT4uk">Turntable</a>
            <img src="/page_images/charModeling/Sample4K.png">
            <p class="font-rhd-r font-white text-size-l"> A character modeling, texturing and rendering practice. The character design is based on this piece from Art Station:
                <a href="https://www.artstation.com/artwork/39OGLg?collection_id=2912537"> (Link) </a>, shown below.
            </p>
            <img src="/page_images/charModeling/csr-miner-kid.jpg">
            <p class="font-rhd-r font-white text-size-l">This practice involves Autodesk Maya & ZBrush for modeling, Marvelous Designer for garment creation, Substance Painter for texture painting, and Redshift Renderer for rendering.</p>
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