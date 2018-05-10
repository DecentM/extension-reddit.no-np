import {debounce,} from 'lodash'

((window, document, undefined) => new Promise((resolve, reject) => {
  'use strict';
  
  const handle = (error) => {
    console.error('An error occurred in reddit.no-np:')
    reject(error)
  }
  
  try {
    const changeLink = ($link) => {
      const rx = /np\.reddit\.com/gi;
      
      $link.href = $link.href.replace(rx, 'reddit.com');
      $link.classList.add('decentm-np-replaced');
    };
    let changedLinks = 0;
    
    const notification = (text) => {
      const $notification = document.createElement('div');
      
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
    
    const log = debounce((text) => {
      notification(text);
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
    }, 400);

    const changeLinks = ($target) => new Promise((resolve, reject) => {
      if (!($target instanceof HTMLElement)) {
        $target = document.body;
      }

      const $links = Array.prototype.slice.call($target.getElementsByTagName('a'));
      const $validLinks = $links.filter(($link) => $link.href.includes('np.reddit.com'));
      
      observer.observe(document.body, {
        'subtree':   true,
        'childList': true,
      });
      
      $validLinks.forEach(($link, index) => {
        requestIdleCallback(() => {
          changeLink($link);
          changedLinks = changedLinks + 1;
          
          if (index + 1 === $validLinks.length) {
            if (changedLinks > 10) {
              log(`Removed no-participation subdomain from ${changedLinks} link(s)`);
            }
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
    
    $stylesheet.type = 'text/css';
    $stylesheet.id = 'decentm-np-replacer-css';
    
    $stylesheet.innerHTML = `
    .decentm-np-replaced::after {
      transition:
      width .25s cubic-bezier(.56,.01,.44,1),
      clip-path .25s cubic-bezier(.56,.01,.44,1) !important;
      
      display: inline-block !important;
      content: "(-NP)" !important;
      width: 0 !important;
      text-align: center !important;
      vertical-align: text-bottom !important;
      height: 0 !important;
      font-weight: 300 !important;
      pointer-events: none !important;
      white-space: nowrap !important;
      clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%) !important;
      margin-left: 0;
    }
    
    .decentm-np-replaced:hover::after {
      width: 45px !important;
      height: 19px !important;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%) !important;
      margin-left: 8px;
    }
    
    .decentm-np-notification {
      padding-top: 16px;
      padding-bottom: 16px;
      padding-left: 24px;
      padding-right: 24px;
      bottom: 2rem;
      right: 2rem;
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
    
    .decentm-np-notification.show {
      opacity: 1;
      transform: scale(1);
      pointer-events: all;
    }
    `;
    
    document.querySelector('body').appendChild($stylesheet);
    changeLinks()
    resolve()
  } catch (error) {
    handle(error)
  }
}))(window, window.document);