<script setup>
import {ref, reactive, computed} from "vue"

const cardsList = [
    {
        thumbnail: "/thumbnails/pointyFinger.png",
        title: "Pointy Finger in Three.js",
        description: "Experimental Character Rig, and creation of IK & pole vector system in Three.js",
        hoverOpacity: {opacity: 0}
    },
    {
        thumbnail: "/thumbnails/Shot 18_0000.png",
        title: "3D Claymation",
        description: "Experimental Claymation-Style 3D animation, made with Cinema 4D & Octane renderer",
        hoverOpacity: {opacity: 0}
    },
    {
        thumbnail: "/thumbnails/Sample4K.png",
        title: "Character Modeling",
        description: "3D Character Modeling & Rendering practice",
        hoverOpacity: {opacity: 0}
    }
]

const hoverStyle = ref({
    position: "absolute",
    height: 100+"%",
    width: 100+"%",
    opacity: 0,
})
</script>

<template>
    <div id="container">
        <div id="scroll">
            <div v-for="(card, i) in cardsList" class="cards" @mouseenter="cardsList[i].hoverOpacity.opacity = 1" @mouseleave="cardsList[i].hoverOpacity.opacity = 0" @click="$emit('toPage',i)">
                <div class="cardContent">
                    <div class="thumbnailContainer"><img class="thumbnails" :src="card.thumbnail"></div>
                    <div class="textArea">
                        <h3 class="heading font-rhd-b font-orange heading-size">{{ card.title }}</h3>
                        <p class="font-rhd-r font-white text-size">{{ card.description }}</p>
                    </div>
                </div>
                <div class="hover" :style="[hoverStyle,cardsList[i].hoverOpacity]">
                    <div style="position:absolute; bottom:0; left:0; width:4vw; height:4vw; border-left-style:solid; border-bottom-style:solid; border-width: 5px; border-color: #dddddd"></div>
                    <div style="position:absolute; bottom:0; right:0; width:4vw; height:4vw; border-right-style:solid; border-bottom-style:solid; border-width: 5px; border-color: #dddddd"></div>
                    <div style="position:absolute; top:0; left:0; width:4vw; height:4vw; border-left-style:solid; border-top-style:solid; border-width: 5px; border-color: #dddddd"></div>
                    <div style="position:absolute; top:0; right:0; width:4vw; height:4vw; border-right-style:solid; border-top-style:solid; border-width: 5px; border-color: #dddddd"></div>
                </div>
            </div>
        </div>
        
    </div>
</template>

<style scoped>
#container {
    position: fixed;
    right: 10vw;
    width: 70vw;
    height: 110vh;
    overflow: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none
}

#scroll {
    margin-top: 15vh;
    display: flex;
    justify-content: center;
    flex-wrap: wrap
}

.cards {
    width: 20vw;
    height: 30vw;
    margin: 1vw;
    cursor: pointer;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    z-index: 5;
}

.cardContent {
    padding: 20px;
    position: absolute;
    box-sizing: border-box;
}

.thumbnailContainer {
    width: 100%;
    height: 16vw;
    position: relative;
}

.thumbnails {
    width: 100%;
    object-fit: cover;
    position: absolute
}

.textArea {
    box-sizing: border-box;
    padding: 4%;
    padding-top: 5%;
    overflow: hidden;
}

.heading {
    padding-bottom: 0.5em;
}


</style>