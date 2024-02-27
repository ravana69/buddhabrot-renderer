// Buddhabrot Renderer
// Created by Frank Force 2020
// License GNU General Public License v3.0

'use strict';

let iterations;
let alpha;
let updateRate;
let scale;
let width;
let height;
let fractalType;
let useSymmetry;
let greyScale;
let rotate;

function Loop()
{
    requestAnimationFrame(Loop);
    
    // update params
    iterations = parseInt(input_iterations.value);
    alpha = parseInt(input_alpha.value);
    updateRate = parseInt(input_updateRate.value);
    width = parseInt(input_width.value);
    height = parseInt(input_height.value);
    scale = parseFloat(input_scale.value * height);
    useSymmetry = checkbox_useSymmetry.checked;
    greyScale = checkbox_greyScale.checked;
    rotate = checkbox_rotate.checked;
    fractalType = parseInt(document.querySelector('input[name="input_fractalType"]:checked').value);
    
    // fractal function
    const centerX = canvas.width * (rotate?.45:.5);
    const centerY = canvas.height * (rotate?.5:.67);
    for(let j = Math.min(updateRate, 1e3); j-->0; )
    {
        // mandelbrot fractal equation
        const A = Math.random()*4 - 2;
        const B = Math.random()*4 - 2;
        const P = [];
        let X = A;
        let Y = B;
        for(let i = iterations; isFinite(X)&&i-->0;)
        {
            [X, Y] = [2*X*Y + A, Y*Y - X*X + B];
            P.push({ X, Y });
        }
        
        // only use points in/out of the mandelbrot set
        if (!isFinite(X) && fractalType == 1 || isFinite(X) && fractalType == 0)
            continue;

        // draw the points
        P.map
        (
            function(p,i)
            {
                // apply color
                if (greyScale)
                    context.fillStyle = `rgb(${ alpha }, ${ alpha }, ${ alpha })`;
                else
                    context.fillStyle = `rgb(
                        ${ i>=iterations/10 ? alpha : 0 },
                        ${ i<iterations/10 && i>=iterations/50 ? alpha : 0 },
                        ${ i<iterations/50 ? alpha : 0 })`;
                    
                // reder the pixel for this point
                const X = (rotate?-p.Y : p.X)*scale;
                const Y = (rotate? p.X : p.Y)*scale;
                context.fillRect(centerX + X|0, Y + centerY|0, 1, 1);
                if (useSymmetry)
                {
                    const r = rotate ? 1 : -1;
                    context.fillRect(centerX + r*X|0, centerY - Y*r|0, 1, 1);
                }
            }
        )
    }
    
    // fit canvas to window
    const aspect = canvas.width/canvas.height;
    const styleWidth = aspect > innerWidth/innerHeight ? 
        innerWidth : innerHeight*aspect;
    canvas.style.width = styleWidth + 'px';
    document.body.style.textAlign = 'center';
}

function Reset()
{
    canvas.width = width;
    canvas.height = height;
    context.fillRect(0, 0, width, height);
    
    // user lighter operation to increment pixel colors
    context.globalCompositeOperation = 'lighter';
}

function Screenshot()
{
    download(canvas.toDataURL('image/png'),'JSBrot.png','image/png');
}

const context = canvas.getContext('2d');
Loop();
Reset();

// load an image
imageFileInput.onchange =(e)=>
{
    const file = e.target.files[0];
   
    if (!file)
        return 0;
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload =(readerEvent)=>
    {
        const content = readerEvent.target.result;
        const image = new Image();
        image.onload =()=>
        {
            // draw the image to the canvas
            canvas.width = width = input_width.value = image.width;
            canvas.height = height = input_height.value = image.height;
            context.fillRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);
            context.globalCompositeOperation = 'lighter';
        }
        
        image.src = content;
    }
}