export const defaultConfig = {
    name: 'default',
    bsOptions: {
        proxy: {
            target: 'http://www.syntaxsuccess.com/viewarticle/socket.io-with-rxjs-in-angular-2.0',
            cookies: { stripeDomain: false }
        },
        port: 3000,
        serveStatic: ['./dist'],
        middleware: [],
        rewriteRules: []
    },
    pimpCmds: [
        {
            url: '*/viewarticle*',
            modifs: [`
          $('head').append('<link rel="stylesheet" type="text/css" href="/css/main.min.css">');
          $('body').append('<script type="text/javascript" src="/js/main.min.js"></script>');
          $('body').addClass('sample-modifier-rules');
          $('.container').html('<p>replaced text</p>');
      `]
        },
        {
            url: '*/sample-url2*',
            modifs: [`
          $('head').append('<link rel="stylesheet" type="text/css" href="/css/main.min.css">');
          $('body').append('<script type="text/javascript" src="/js/main.min.js"></script>');
          $('body').addClass('sample-modifier-rules2');
      `]
        }
    ]
};
