const $ = document.querySelectorAll.bind(document);

document.addEventListener('DOMContentLoaded', function(event) {
    $('.menu > .item > span').forEach(item => item.addEventListener('click', onClickMenuItem));
    $('.menu > .item > span').forEach(item => item.addEventListener('mouseenter', onMouseEnterMenuItem));
});

document.addEventListener('click', function(event) {
    $('.menu > .item.expanded').forEach(item => item.classList.remove('expanded'));
});

function onClickMenuItem(event) {
    event.currentTarget.parentElement.classList.toggle('expanded');
    event.stopPropagation();
}

function onMouseEnterMenuItem(event) {
    $('.menu > .item.expanded').forEach(item => {
        if (item.firstChild !== event.currentTarget) item.classList.remove('expanded');
        event.currentTarget.parentElement.classList.add('expanded');
    });
}