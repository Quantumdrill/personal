<script setup>
    import {ref, computed, reactive} from "vue"
    import {gsap} from "gsap"
    import { MotionPathPlugin } from "gsap/MotionPathPlugin";
    import worksGallery from "./worksGallery.vue"
    import pointyFinger from "./pages/pointyFinger.vue"
    import claymation from "./pages/claymation.vue"
    import charModeling from "./pages/characterArt.vue"

    gsap.registerPlugin(MotionPathPlugin);

    
    
    const windowSize = ref({
        vw: window.innerWidth/100,
        vh: window.innerHeight/100
    })
    let cursorPos = ref({
        x: window.innerWidth/2,
        y: window.innerHeight/2
    })
    function updateCursorPos(e){
        cursorPos.value.x = e.clientX-window.innerWidth/2
        cursorPos.value.y = e.clientY-window.innerHeight/2
    }

    // set circle radius and position
    const radius = ref(80*windowSize.value.vw)
    const textRadiusOut = radius.value+20
    const textRadiusIn = computed(()=>{return radius.value-25})
    let fixedCenter = {
        x: 70*windowSize.value.vw,
        y: 70*windowSize.value.vh+ radius.value
    }
    let baseCenter = ref({
        x: fixedCenter.x,
        y: fixedCenter.y
    })
    let center = computed(()=>({
        x: baseCenter.value.x + cursorPos.value.x/70,
        y: baseCenter.value.y + cursorPos.value.y/70,
    }))
    
    const circleTranslate = computed(()=>({
        transform: `translate(${center.value.x}px, ${center.value.y}px)`,
    }))
    const circleStyle = computed(()=>({
        position: "fixed",
        borderRadius: "50%",
        left: `${-radius.value}px`,
        top: `${-radius.value}px`,
        width: `${radius.value*2}px`,
        height: `${radius.value*2}px`,
        overflow: "hidden"
    }))
    const pathTextHomeStyle = reactive({
        position: "fixed",
        display: "block"
    })
    const pathTextWorksStyle = reactive({
        position: "fixed",
        display: "none",
        zIndex: 2,
    })
    const pathTextPageStyle = reactive({
        position: "fixed",
        display: "none",
        zIndex: 2,
    })

    const tspanHovers = ref({
        hover1: {opacity: 0},
        hover2: {opacity: 0},
    })

    //anims
    const homePathTextOffset = ref(49)
    const worksPathTextOffset = ref(30)
    const pagePathTextOffset = ref(60)
    function homeToWorks(){
        let tl = gsap.timeline()
        tl.to(homePathTextOffset, {
            value: 20,
            duration: 0.5,
            ease: "power2.in",
            onComplete: ()=>{pathTextHomeStyle.display = "none"}
        }).to(baseCenter.value, {
            duration: 1,
            ease: "power2.inOut",
            motionPath: {
                path:[
                    {x:110*windowSize.value.vw, y:0*windowSize.value.vh+radius.value},
                    {x:90*windowSize.value.vw, y:20*windowSize.value.vh}
                ],
                fromCurrent: true,
                curviness:2
            }
        }, "<").to(worksPathTextOffset, {
            value: 54,
            duration: 0.5,
            ease: "power2.out",
            onStart: ()=>{ pathTextWorksStyle.display="block"},
        }, "-=0.3").to(worksGallStyle, {
            opacity: 1,
            duration: 0.5,
        }, "<")
    }

    function worksToPage(n){
        let tl= gsap.timeline()
        tl.to(worksPathTextOffset, {
            value: 70,
            duration: 0.5,
            ease: "power2.in",
            onComplete: ()=>{ pathTextWorksStyle.display="none"},
        }).to(worksGallStyle, {
            opacity: 0,
            duration: 0.2,
        }, "<").to(radius, {
            value: 95*windowSize.value.vw,
            duration: 0.5,
            ease: "power2.inOut",
        }, "-=0.2").to(pagePathTextOffset, {
            value: 55.2,
            duration: 0.5,
            ease: "power2.out",
            onStart: ()=>{ pathTextPageStyle.display="block"},
        }).to(pageStyles.general, {
            opacity: 1,
            duration: 0.5,
            onStart: ()=>{
                if (n === 0){
                    pageStyles.pointyFinger.display = "block"
                } else if (n===1){
                    pageStyles.claymation.display = "block"
                } else if (n===2){
                    pageStyles.charModeling.display = "block"
                }
            }
        }, "<")
    }

    function pageToWorks(){
        let tl= gsap.timeline()
        tl.to(pageStyles.general, {
            opacity: 0,
            duration: 0.5,
            onComplete: ()=>{
                pageStyles.pointyFinger.display = "none"
                pageStyles.claymation.display = "none"
                pageStyles.charModeling.display = "none"
            }
        }).to(pagePathTextOffset, {
            value: 60,
            duration: 0.5,
            ease: "power2.in",
            onCompleted: ()=>{ pathTextPageStyle.display="none"},
        }, "<").to(radius, {
            value: 80*windowSize.value.vw,
            duration: 0.5,
            ease: "power2.inOut",
        }, "-=0.2").to(worksPathTextOffset, {
            value: 54,
            duration: 0.5,
            ease: "power2.out",
            onStart: ()=>{ pathTextWorksStyle.display="block"},
        }).to(worksGallStyle, {
            opacity: 1,
            duration: 0.2,
        }, "<")
    }

    //works gallery
    let worksGallState = ref(false)
    const worksGallStyle = reactive({
        position: "absolute",
        left: 17+"vw",
        top: -30*windowSize.value.vh+radius.value+"px",
        zIndex: 4,
        opacity: 0,
    })

    //pages
    const pageStyles = reactive({
        general: {opacity: 0, zIndex: 6, position: "absolute", right: 20+"vw"},
        pointyFinger: {display: "none"},
        claymation: {display: "none"},
        charModeling: {display: "none"}
    })
</script>

<template>
    <div @mousemove="updateCursorPos($event)">
        <div id="circle" class="bg-dark" :style="[circleTranslate,circleStyle]">
            <worksGallery class="worksGallery" :style="worksGallStyle" @toPage="worksToPage"/>
        </div>
        <svg
        width="100vw"
        height="100vh"
        id="path-text-home"
        :style="pathTextHomeStyle"
        >
            <path
                id="arcHome"
                :d="`M ${center.x} ${textRadiusOut+center.y} A ${textRadiusOut} ${textRadiusOut} 0 0 1 ${center.x} ${center.y-textRadiusOut} A ${textRadiusOut} ${textRadiusOut} 0 0 1 ${center.x} ${textRadiusOut+center.y}`" 
                fill="none"
            />
            <text class="svg-dark tab-size">
                <textPath
                href="#arcHome"
                :startOffset="homePathTextOffset+cursorPos.x/2000+'%'"
                text-anchor="middle"
                >
                    <tspan class="tspanHovers font-rhd-b" :style="tspanHovers.hover1">[</tspan>
                    <tspan class="tspans font-cpo-i" @mouseenter="tspanHovers.hover1.opacity=1" @mouseleave="tspanHovers.hover1.opacity=0" @click="homeToWorks">works</tspan>
                    <tspan class="tspanHovers font-rhd-b" :style="tspanHovers.hover1">]</tspan>
                    <tspan dx="1em" class="tspanHovers font-rhd-b" :style="tspanHovers.hover2">[</tspan>
                    <tspan class="tspans font-cpo-i" @mouseenter="tspanHovers.hover2.opacity=1" @mouseleave="tspanHovers.hover2.opacity=0">about</tspan>
                    <tspan class="tspanHovers font-rhd-b" :style="tspanHovers.hover2">]</tspan>
                </textPath>
            </text>
        </svg>
        <svg
        width="30vw"
        height="100vh"
        id="path-text-works"
        :style="pathTextWorksStyle"
        >
            <path
                id="arcWork"
                :d="`M ${textRadiusIn+center.x} ${center.y} A ${textRadiusIn} ${textRadiusIn} 0 0 0 ${center.x-textRadiusIn} ${center.y} A ${textRadiusIn} ${textRadiusIn} 0 0 0 ${textRadiusIn+center.x} ${center.y}`" 
                fill="none"
            />
            <text class="svg-orange tab-size">
                <textPath
                href="#arcWork"
                :startOffset="worksPathTextOffset+cursorPos.y/2000+'%'"
                text-anchor="middle"
                side="right"
                >
                    <tspan class="tspanHovers font-rhd-b" :style="tspanHovers.hover1">[</tspan>
                    <tspan class="font-cpo-i svg-red">works</tspan>
                    <tspan class="tspanHovers font-rhd-b" :style="tspanHovers.hover1">]</tspan>
                    <tspan dx="1em" class="tspanHovers font-rhd-b" :style="tspanHovers.hover2">[</tspan>
                    <tspan class="tspans font-cpo-i" @mouseenter="tspanHovers.hover2.opacity=1" @mouseleave="tspanHovers.hover2.opacity=0">about</tspan>
                    <tspan class="tspanHovers font-rhd-b" :style="tspanHovers.hover2">]</tspan>
                </textPath>
            </text>
        </svg>
        <svg
        width="30vw"
        height="100vh"
        id="path-text-page"
        :style="pathTextPageStyle"
        >
            <path
                id="arcPage"
                :d="`M ${textRadiusIn+center.x} ${center.y} A ${textRadiusIn} ${textRadiusIn} 0 0 0 ${center.x-textRadiusIn} ${center.y} A ${textRadiusIn} ${textRadiusIn} 0 0 0 ${textRadiusIn+center.x} ${center.y}`" 
                fill="none"
            />
            <text class="svg-orange tab-size">
                <textPath
                href="#arcPage"
                :startOffset="pagePathTextOffset+cursorPos.y/2000+'%'"
                text-anchor="middle"
                side="right"
                >
                    <tspan dx="1em" class="tspanHovers font-rhd-b" :style="tspanHovers.hover1">[</tspan>
                    <tspan class="tspans font-cpo-i" @mouseenter="tspanHovers.hover1.opacity=1" @mouseleave="tspanHovers.hover1.opacity=0" @click="pageToWorks">back</tspan>
                    <tspan class="tspanHovers font-rhd-b" :style="tspanHovers.hover1">]</tspan>
                </textPath>
            </text>
        </svg>
        <div :style="[pageStyles.pointyFinger,pageStyles.general]"><pointyFinger /></div>
        <div :style="[pageStyles.charModeling,pageStyles.general]"><charModeling /></div>
        <div :style="[pageStyles.claymation,pageStyles.general]"><claymation /></div>
    </div>
</template>

<style scoped>
.tspans:hover {
    cursor:pointer;
}

</style>