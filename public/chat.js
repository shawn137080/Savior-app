// make connection
var socket = io.connect('http://localhost:3000'),
 
var message = document.getElementById('message'),
    name = document.getElementById('name'),
    btn = document.getElementById('btn'),
    output = document.getElementById('output'),
    feedback = document.getElementById('feedback');

btn.addEventListener('click',function(){
    socket.emit('chat',{
        message:message.value,
        handle: handle.value
    });
});

message.addEventListener('keypress',function(data){
    socket.emit('typing',handle.value)
});

socket.on('typing',function(data){
    socket.broadcast.emit('typing')
})





//listen for events

socket.on('chat',function(data){
    output.innerHTML += '<p>'+ data.handle +':' + data.message +'</p>'
});

socket.on('typing',function(data){
    feedback.innerHTML = '<p>'+ data + 'is typing ...</P>';
});
