<script setup>
    import {useTemplateRef} from "vue"
    document.title = "oiiaioiiiai"
    const oiiaAudio = useTemplateRef("oiia")
</script>
<template>
    <div id="body">
        <div id="imgContainer">
            <img src="https://i.makeagif.com/media/10-26-2024/79S5ln.gif">
            <div id="mask"></div>
        </div>
        <button @click="oiiaAudio.play()">♪oiiaioiiiai♪</button>
        <audio ref="oiia"><source src="/oiiaioiiiai.mp3" type="audio/mpeg"></audio>
        <p>music: <a href="https://open.spotify.com/track/5fr7VBuNTiXAq4rH1e3v3q?si=c46ac406892d49bc">OIIA OIIA (Spinning Cat) - W&W</a></p>
    </div>
</template>
<style scoped>
* {
    margin: 0;
}

#body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    flex-direction: column;
    background-color: rgb(0, 255, 0);
}

#imgContainer {
    height: 50vh;
    position: relative;
}

img {
    height: 50vh;
}

#mask {
    position: absolute;
    width: 30vh;
    height: 10vh;
    z-index: 2;
    background-color: rgb(0, 255, 0);
    right: 0;
    bottom: 0;
}

p {
    position: fixed;
    bottom: 0;
    left: 0;
    font-size: 10px;
}

button {
    border: none;
    border-radius: 3px;
    font-size: 20px;
    padding: 10px;
    box-sizing: border-box;
    cursor: pointer;
}
</style>