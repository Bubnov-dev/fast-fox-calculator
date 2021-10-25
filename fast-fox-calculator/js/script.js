$(document).ready(function () {
    
    const buttons = document.querySelectorAll('.calculator__info');
    const tooltips = document.querySelectorAll('.calculator__info-tooltip');

    for(let i=0; i<buttons.length; i++){
      let button = buttons[i];
      let tooltip = tooltips[i];
      let popperInstance = Popper.createPopper(button, tooltip, {
          modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 8],
                },
              },
            ],
          
      });

      function show() {
          tooltip.setAttribute('data-show', '');
        
          // We need to tell Popper to update the tooltip position
          // after we show the tooltip, otherwise it will be incorrect
          popperInstance.update();
        }
        
        function hide() {
          tooltip.removeAttribute('data-show');
        }
        
        let showEvents = ['mouseenter', 'focus'];
        let hideEvents = ['mouseleave', 'blur'];
        
        showEvents.forEach((event) => {
          button.addEventListener(event, show);
        });
        
        hideEvents.forEach((event) => {
          button.addEventListener(event, hide);
        });
    }

    const selects = () => {
      const elements = document.querySelectorAll('.custom-select');
      elements.forEach(element=>{
         let choices = new Choices(element, {
          searchEnabled: false,
          itemSelectText: "",
          placeholder: true,
          placeholderValue: "none",
        });
      })
     
    }

    selects();
    input = $("#gerber-file")
    input.on('change', function(e){
      console.log(input[0].files[0].size)
      if (input[0].files[0].size > 10000000){
        input.val('');
      }
      else {

        var fileName = '';

        if( $(this)[0].files && $(this)[0].files.length > 1 ){
          fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
        }
        else{
          fileName = e.target.value.split( '\\' ).pop();
        }

        let ext  = fileName.split('.').pop();
        if (ext == "zip"){
          $("#gerber-subtitle").html(fileName); 
        }
        else {
          input.val('');

        }

        
      }
      
    })

})