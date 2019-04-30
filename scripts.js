const defaultState = {
  currentColor: '#333333',
  prevColor: '#666666',
  color1: 'red',
  color2: 'blue',
  figures: [
    { left: 0, top: 0, color: '#123123' },
    { left: 210, top: 0, color: '#123123' },
    { left: 420, top: 0, color: '#123123' },
    { left: 0, top: 210, color: '#123123' },
    { left: 210, top: 210, color: '#123123' },
    { left: 420, top: 210, color: '#123123' },
    { left: 0, top: 420, color: '#123123' },
    { left: 210, top: 420, color: '#123123' },
    { left: 420, top: 420, color: '#123123' },

  ],
  currentTool: null,

};
let currentSettings = {

};
function figureClickHandler(element, event) {
  if (currentSettings.currentTool === 'bucket') {
    element.css('background-color', currentSettings.currentColor);
    const idx = +element.attr('id').charAt(0);
    currentSettings.figures[idx].color = currentSettings.currentColor;
    event.stopPropagation();
  } else if (currentSettings.currentTool === 'transform') {
    const idx = +element.attr('id').charAt(0);
    currentSettings.figures[idx].shape = element.hasClass('round') ? 'square' : 'round';
    element.toggleClass('round');
    event.stopPropagation();
  }
}

function allowDrop(event) {
  $(event.target).addClass('light-border');
  event.preventDefault();
}
function setEventsListners(element) {
  element.on('click', event => figureClickHandler(element, event));
  element.on('dragover', event => allowDrop(event));
  element.on('dragleave', event => $(event.target).removeClass('light-border'));
  element.on('mousedown', (ev) => {
    const event = ev;
    if (currentSettings.currentTool === 'move') {
      event.target.style.zIndex = 9999;
    }
  });
  element.on('mouseup', (ev) => {
    const event = ev;
    if (currentSettings.currentTool === 'move') {
      event.target.style.zIndex = 1;
    }
  });
  element.on('dragstart', (ev) => {
    const event = ev;
    if (currentSettings.currentTool !== 'move') {
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    event.originalEvent.dataTransfer.setData('text', event.target.id);
    event.originalEvent.dataTransfer.setData('clientX', event.originalEvent.offsetX);
    event.originalEvent.dataTransfer.setData('clientY', event.originalEvent.offsetY);
    event.originalEvent.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { element.hide(); }, 0);
    // element.hide();
  });
  element.on('dragend', () => element.show());
  element.on('drop', (event) => {
    const second = $(`#${event.originalEvent.dataTransfer.getData('text')}`);
    const secondLeft = second.css('left');
    const secondTop = second.css('top');
    const first = element;
    second.css('top', first.css('top'));
    second.css('left', first.css('left'));
    first.css('top', secondTop);
    first.css('left', secondLeft);
    second.show();
    second[0].style.zIndex = '1';

    let idx = +element.attr('id').charAt(0);

    currentSettings.figures[idx].left = element.css('left').replace('px', '');
    currentSettings.figures[idx].top = element.css('top').replace('px', '');

    idx = +second.attr('id').charAt(0);

    currentSettings.figures[idx].left = second.css('left').replace('px', '');
    currentSettings.figures[idx].top = second.css('top').replace('px', '');
    event.stopPropagation();
  });
}

function getState() {
  const settings = localStorage.getItem('palete-settings');
  if (settings) {
    return { ...defaultState, ...JSON.parse(settings) };
  }
  return defaultState;
}
function setCurrentColor(val) {
  if (val) {
    currentSettings.prevColor = currentSettings.currentColor;
    currentSettings.currentColor = val;
    $('#current-color').css('background-color', currentSettings.currentColor);
    $('#prev-color').css('background-color', currentSettings.prevColor);
  }
}
function onBodyClick(e) {
  const elem = document.elementFromPoint(e.clientX, e.clientY);
  if (elem && currentSettings.currentTool === 'chooser') {
    setCurrentColor(window.getComputedStyle(elem).backgroundColor);
  }
}
function selectTool(tool) {
  $('.tool-item').removeClass('active');
  if (currentSettings.currentTool !== tool) {
    currentSettings.currentTool = tool;
    $(`#${tool}`).toggleClass('active');
  } else {
    currentSettings.currentTool = null;
  }
  if (currentSettings.currentTool === 'move') {
    $('.figure').attr('draggable', true);
  } else {
    $('.figure').attr('draggable', false);
  }
}

$(document).ready(() => {
  $('.tool-item').on('click', (event) => {
    const { id } = event.target;
    selectTool(id);
    event.stopPropagation();
  });
  $('body').on('click', onBodyClick);
  const state = getState();
  currentSettings = state;
  const container = $('.palete-container');
  currentSettings.figures.forEach((fig, idx) => {
    const newEl = $('<div></div>')
      .addClass('figure')
      .css('left', `${fig.left}px`)
      .css('top', `${fig.top}px`)
      .css('background-color', fig.color)
      .attr('id', `${idx}idx`)
      .attr('draggable', true)
      .attr('dropable', true);
    if (fig.shape === 'round') {
      newEl.addClass('round');
    }
    container.append(newEl);
    setEventsListners(newEl);
  });
  if (currentSettings.currentTool) {
    $(`#${currentSettings.currentTool}`).addClass('active');
  }
  $('#current-color').css('background-color', currentSettings.currentColor);
  $('#prev-color').css('background-color', currentSettings.prevColor);
  $('#color1').css('background-color', currentSettings.color1);
  $('#color2').css('background-color', currentSettings.color2);

  container.on('drop', (event) => {
    const second = $(`#${event.originalEvent.dataTransfer.getData('text')}`);
    const clX = event.originalEvent.dataTransfer.getData('clientX');
    const clY = event.originalEvent.dataTransfer.getData('clientY');
    const secondTop = `${-clY + event.originalEvent.offsetY}px`;
    const secondLeft = `${-clX + event.originalEvent.offsetX}px`;
    second.css('left', secondLeft);
    second.css('top', secondTop);
    second[0].style.zIndex = '1';
    const idx = +second.attr('id').charAt(0);
    currentSettings.figures[idx].left = second.css('left').replace('px', '');
    currentSettings.figures[idx].top = second.css('top').replace('px', '');
  });
});

$(window).on('beforeunload', () => {
  localStorage.setItem('palete-settings', JSON.stringify(currentSettings));
});
