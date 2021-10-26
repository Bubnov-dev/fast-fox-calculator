var test2 ="s";

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
          tooltip.attr('data-show', '');
        
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


    let cfs = new Map([
      [
        'materials', new Map([
          ['FR-4', 1],
          ["Alu", 1.15]
        ])
      ],
      [
       'layers', new Map([
          ["1", 1] ,
          ["2", 1.2],
          ["4", 1.8],
          ["6", 2.5],
        ])
      ],
      [
        'designs', new Map([
          ["1", 1],
          ["2", 1.2],
          ["3", 1.8],
          ["4", 2.5]
        ])
      ],
      [
        "width-plate", new Map([
          ["0.4", 1],
          ["0.6", 1.2],
          ["0.8", 1.8],
          ["1.0", 2.5]
        ])
      ],
      [
      "finish", new Map([
        ["HASL", 1],
        ["LFHASL", 1.2],
        ["ENIG", 1.8]
       ])
      ],
      [
        "width-cu", new Map([
          ["35", 1],
          ["70", 1.2]
        ])
      ]
    ])

    console.log(cfs);

    //отслеживание инпутов, реализация логики
    jQuery.expr[':'].regex = function(elem, index, match) {
      var matchParams = match[3].split(','),
          validLabels = /^(data|css):/,
          attr = {
              method: matchParams[0].match(validLabels) ? 
                          matchParams[0].split(':')[0] : 'attr',
              property: matchParams.shift().replace(validLabels,'')
          },
          regexFlags = 'ig',
          regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
      return regex.test(jQuery(elem)[attr.method](attr.property));
    }

    let needDoubleReftesh = true
    function refresh(){
      $("input").removeAttr("disabled")


      //Материал
      if($("[name=\"materials\"]:checked").val() == "alu"){
        $("[name=\"layers\"]:regex(value, 2|4|6)").attr("disabled", "disabled")
        $("[name=\"width-plate\"]:regex(value, 0.4|0.6|0.8|2.0)").attr("disabled", "disabled")
        $("[name=\"color-mask\"]:regex(value, purple|red|yellow|blue)").attr("disabled", "disabled")
        $("[name=\"finish\"]:regex(value, ENIG)").attr("disabled", "disabled")
        $("[name=\"width-cu\"]:regex(value, 70)").attr("disabled", "disabled")

        
      }

      //Количество слоев
      if($("[name=\"layers\"]:checked").val() == "1"){
        $("[name=\"width-plate\"]:regex(value, 0.4|0.6|0.8)").attr("disabled", "disabled")
        $("[name=\"color-mask\"]:regex(value, purple)").attr("disabled", "disabled")
        $("[name=\"width-cu\"]:regex(value, 70)").attr("disabled", "disabled")
      }

      if($("[name=\"layers\"]:checked").val() == "4"){
        $("[name=\"width-plate\"]:regex(value, 0.4|0.6)").attr("disabled", "disabled")
        $("[name=\"width-cu\"]:regex(value, 70)").attr("disabled", "disabled")
      }

      if($("[name=\"layers\"]:checked").val() == "6"){
        $("[name=\"width-plate\"]:regex(value, 0.4|0.6|0.8|1.0)").attr("disabled", "disabled")
        $("[name=\"color-mask\"]:regex(value, purple)").attr("disabled", "disabled")
      }

      //Панелизация
      if($("[name=\"panels\"]").val() == "service"){
        $("[name=\"designs\"]:regex(value, [2-9])").attr("disabled", "disabled")

      }





      $("[disabled]").prop('checked', false);
      
      if(needDoubleReftesh){
        needDoubleReftesh = false
        refresh();
      }
      else {
        needDoubleReftesh = true
      }
    }

  refresh()

   $("input, select").on("change", function(){
     refresh()
   })
})

