
    // 데이터처리 로딩화면 시작
    export const start = () => {
        $("body").css({'opacity':"0.3 !important"});
        const _loading = $(`<div id="js-loading"></div>`);
        
        _loading.css({ "top": `${$(window).scrollTop()}px`, "left": `0px` });
        $('html').addClass("loading");
        $('body').append( _loading );
    }

    // 데이터처리 로딩화면 종료
    export const end = () => {
        $("#js-loading").remove();
        $('html').removeClass("loading");
    }