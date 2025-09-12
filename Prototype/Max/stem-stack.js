/*

outlets = 3;

const msg_stack = [];
function mute()
{
    if(msg_stack.length === 0) return;
    
   let last_msg = msg_stack.pop();

   for(let i = 2; i < last_msg.length; i+=3)
   {
    last_msg[i] = 0;
   }
   post(last_msg);
   outlet(2, last_msg);
}

function play(...elements)
{
  const exists = msg_stack.some(arr =>
    Array.isArray(arr) &&
    arr.length === elements.length &&
    arr.every((v, i) => Object.is(v, elements[i]))
    );

    if (exists) return;

    msg_stack.push(elements);
    outlet(0, elements);
    outlet(1, msg_stack);
}

function clear()
{
    msg_stack.length = 0;
}

*/


//Jeder Node hat eine Sound-ID. Dann von Wurzel bis in alle Blätter traversieren. Alle IDs spielen, alle andern werden gemutet