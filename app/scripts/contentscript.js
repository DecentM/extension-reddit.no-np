import {debounce,} from 'lodash'

((window, document, undefined) => new Promise((resolve, reject) => {
  'use strict';
  
  const handle = (error) => {
    console.error('An error occurred in reddit.no-np:')
    reject(error)
  }
  
  try {
    const tooltip = ({
      show = true
    }) => {
      const $tooltip = document.getElementById('decentm-np-tooltip');
      
      if (show) {
        $tooltip.classList.add('show')
      } else {
        $tooltip.classList.remove('show')
      }
    }
    
    const repositionTooltip = debounce(({
      vertical = 0,
      horizontal = 0
    }) => {
      const $tooltip = document.getElementById('decentm-np-tooltip');
      const width = $tooltip.offsetWidth
      const height = $tooltip.offsetHeight

      $tooltip.style.transform = [
        `translate(${horizontal - width / 2}px, ${vertical - height - 16}px)`,
        `scale(1)`
      ].join(' ');
    }, 150);

    const changeLink = ($link) => {
      const rx = /np\.reddit\.com/gi;
      
      $link.href = $link.href.replace(rx, 'reddit.com');
      $link.classList.add('decentm-np-replaced');
      
      $link.addEventListener('mouseover', () => {
        tooltip({
          'show': true,
        });
      });

      $link.addEventListener('mouseout', () => {
        tooltip({
          'show': false,
        });
      });

      $link.addEventListener('mousemove', ({clientY, clientX}) => {
        repositionTooltip({
          'vertical':   clientY,
          'horizontal': clientX,
        });
      });
    };
    let changedLinks = 0;
    
    const notification = (text) => {
      const $notification = document.createElement('div');
      
      $notification.classList.add('decentm-np-block');
      $notification.classList.add('decentm-np-notification');
      $notification.innerHTML = text;

      document.body.appendChild($notification);
      setTimeout(() => {
        $notification.classList.add('show')
      }, 1);

      setTimeout(() => {
        $notification.classList.remove('show');

        setTimeout(() => {
          $notification.remove();
        }, 500);
      }, 4000);
      
      changedLinks = 0;
    }
    
    const log = debounce((text, {
      devtools = true,
      page = true,
    }) => {
      if (page) {
        notification(text);
      }
      
      if (devtools) {
        console.log(
          `%c ${text} %c https://github.com/DecentM/extension-reddit.no-np`,
          [
            'color: white;',
            'padding: 5px;',
            'padding-left: 7px;',
            'padding-right: 7px;',
            'background: linear-gradient(130deg, #000FE5, #005FFF);',
            'border-radius: 3px;',
            'margin-right: 16px;',
          ].join(''),
          [
            'margin-bottom: 16px;',
            'margin-top: 16px;',
          ].join('')
        );
      }
    }, 400);

    const changeLinks = ($target) => new Promise((resolve, reject) => {
      if (!($target instanceof HTMLElement)) {
        $target = document.body;
      }

      const $links = Array.prototype.slice.call($target.getElementsByTagName('a'));
      const $validLinks = $links.filter(($link) => $link.href.includes('np.reddit.com'));
      
      $validLinks.forEach(($link, index) => {
        requestIdleCallback(() => {
          changeLink($link);
          changedLinks = changedLinks + 1;
          
          if (index + 1 === $validLinks.length) {
            log(`Removed no-participation subdomain from ${changedLinks} link(s)`, {
              'page': changedLinks > 10
            });
          }
        });
      });
    })

    const mutationHandler = (mutationList) => {
      mutationList.forEach((mutation) => {
        changeLinks(mutation.target)
      })
    };
    const observer = new MutationObserver(mutationHandler)
    const $stylesheet = document.createElement('style');

    observer.observe(document.body, {
      'subtree':   true,
      'childList': true,
    });
    
    $stylesheet.type = 'text/css';
    $stylesheet.id = 'decentm-np-replacer-css';
    
    $stylesheet.innerHTML = `
    .decentm-np-block {
      padding-top: 16px;
      padding-bottom: 16px;
      padding-left: 24px;
      padding-right: 24px;
      background: linear-gradient(130deg, #000FE5, #005FFF);
      font-size: 14px;
      color: white;
      border-radius: 3px;

      position: fixed;
      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;
      z-index: 99999999999;
      
      opacity: 0;
      transform: scale(.9);
      pointer-events: none;
      
      transition-property: transform, opacity;
      transition-duration: .3s;
      transition-timing-function: ease-in-out;
    }
    
    .decentm-np-notification {
      bottom: 2rem;
      right: 2rem;
    }
    
    .decentm-np-block.show {
      opacity: 1;
      transform: scale(1);
      pointer-events: all;
    }
    
    .decentm-np-tooltip {
      top: 0;
      left: 0;
      pointer-events: none !important;
    }
    `;
    
    const $tooltip = document.createElement('div')
    
    $tooltip.classList.add('decentm-np-block')
    $tooltip.classList.add('decentm-np-tooltip')
    $tooltip.id = 'decentm-np-tooltip'
    $tooltip.innerHTML = '(-NP)'

    document.body.appendChild($tooltip);
    document.body.appendChild($stylesheet);

    changeLinks()
    resolve()
  } catch (error) {
    handle(error)
  }
}))(window, window.document);