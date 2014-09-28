
var mainScroller;



function refreshScroll() {

    if (appConfig.iScroll) {
        if (!_.isObject(mainScroller)) {
            setTimeout(function () {
                mainScroller = new IScroll('#mainWrapper', {
                    scrollY: true,
                    scrollbars: false
                });

                document.addEventListener('touchmove', function (e) {
                    e.preventDefault();
                }, false);

            }, 300);
        }
        else {
            setTimeout(function () {
                mainScroller.refresh();
            }, 190)
        }
    }

}

function scrollTop() {

    if (appConfig.iScroll) {
        mainScroller.scrollTo(0, 0);
    }
    else{
        $("#mainWrapper").animate({ scrollTop: 0 }, "slow");
    }


}

function destroyScroll() {
    if (appConfig.iScroll) {
        if (!_.isObject(mainScroller)) {
            mainScroller.destroy();
        }
    }
}
