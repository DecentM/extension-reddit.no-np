import assert from 'assert'

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
    
    const log = (text) => {
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
    };

    const changeLinks = ($target) => new Promise((resolve, reject) => {
      let changedLinks = 0;

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
            log(`Removed no-participation subdomain from ${changedLinks} link(s)`);
            changedLinks = 0;
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
    
    window.addEventListener('load', changeLinks);
    
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
    `;
    
    document.querySelector('body').appendChild($stylesheet);
    resolve()
  } catch (error) {
    handle(error)
  }
}))(window, window.document);