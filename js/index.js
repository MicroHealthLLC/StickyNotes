(function($)
{
    /**
     * Auto-growing textareas; technique ripped from Facebook
     *
     * http://github.com/jaz303/jquery-grab-bag/tree/master/javascripts/jquery.autogrow-textarea.js
     */
    $.fn.autogrow = function(options)
    {
        return this.filter('textarea').each(function()
        {
            var self         = this;
            var $self        = $(self);
            var minHeight    = $self.height();
            var noFlickerPad = $self.hasClass('autogrow-short') ? 0 : parseInt($self.css('lineHeight')) || 0;

            var shadow = $('<div></div>').css({
                position:    'absolute',
                top:         -10000,
                left:        -10000,
                width:       $self.width(),
                fontSize:    $self.css('fontSize'),
                fontFamily:  $self.css('fontFamily'),
                fontWeight:  $self.css('fontWeight'),
                lineHeight:  $self.css('lineHeight'),
                resize:      'none',
                'word-wrap': 'break-word'
            }).appendTo(document.body);

            var update = function(event)
            {
                var times = function(string, number)
                {
                    for (var i=0, r=''; i<number; i++) r += string;
                    return r;
                };

                var val = self.value.replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/&/g, '&amp;')
                                    .replace(/\n$/, '<br/>&nbsp;')
                                    .replace(/\n/g, '<br/>')
                                    .replace(/ {2,}/g, function(space){ return times('&nbsp;', space.length - 1) + ' ' });

                // Did enter get pressed?  Resize in this keydown event so that the flicker doesn't occur.
                if (event && event.data && event.data.event === 'keydown' && event.keyCode === 13) {
                    val += '<br />';
                }

                shadow.css('width', $self.width());
                shadow.html(val + (noFlickerPad === 0 ? '...' : '')); // Append '...' to resize pre-emptively.
                $self.height(Math.max(shadow.height() + noFlickerPad, minHeight));
            }

            $self.change(update).keyup(update).keydown({event:'keydown'},update);
            $(window).resize(update);

            update();
        });
    };
})(jQuery);


var noteTemp =  '<div class="note">'
				+	'<a href="javascript:;" class="button remove">X</a>'
				+ 	'<div class="note_cnt">'
				+		'<textarea class="title" placeholder="Enter note title"></textarea>'
				+ 		'<textarea class="cnt" placeholder="Enter note description here"></textarea>'
				+	'</div> '
				+'</div>';

var noteZindex = 1;
function deleteNote(){
    $(this).parent('.note').find('.title').val("");
    $(this).parent('.note').find('.cnt').val("");
    $(this).parent('.note').hide("puff",{ percent: 133}, 250);
};

function newNote() {
  $(noteTemp).hide().appendTo("#board").show("fade", 300).draggable().on('dragstart',
    function(){
       $(this).zIndex(++noteZindex);
    });
 
	$('.remove').click(deleteNote);
	$('textarea').autogrow();
	
    $('.note')
	return false; 
};




var json;


function handleFileSelect(evt) {
	var files = evt.target.files;
	var output = [];
	for (var i = 0, f; f = files[i]; i++) {
		var reader = new FileReader();
		reader.onload = (function (theFile) {
			return function (e) {
				console.log('e readAsText = ', e);
				console.log('e readAsText target = ', e.target);
				try {
					json = JSON.parse(e.target.result);
                    $("#preview").val(json);
				} catch (ex) {
//                    $("#preview").val('ex when trying to parse json = ' + ex);
					alert('ex when trying to parse json = ' + ex);
				}
			}
		})(f);
		reader.readAsText(f);
	}
}
document.getElementById("loadjson").addEventListener("change", handleFileSelect, false);


var expnotes;


function gatherNotes() {
    "use strict";
    var i, expnotes = "";
    var notes = document.querySelectorAll(".note");
    var notetitle = document.querySelectorAll(".title");
    var notecnt = document.querySelectorAll(".cnt");
    for (i = 0; i < notes.length; i+=1) {
        if (!((notetitle[i].value === "") && (notecnt[i].value === ""))) {
            expnotes = expnotes + '{"title": "' + notetitle[i].value + '", "cnt": "' + notecnt[i].value + '"},';
        }
    }
    expnotes = expnotes.slice(0,-1);
    return expnotes;  
}


$("#export_notes").click(function() {
    "use strict";
    expnotes = gatherNotes();
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(expnotes));
    var dlAnchorElem = document.getElementById("downloadAnchorElem");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "newnotes.json");
    dlAnchorElem.click();
});


$("#import_notes").click(function () {
    "use strict";
    $("#loadjson").val("");   
    $("#importnotes").show();
});


$("#cancel_upload").click(function () {
    "use strict";
    $("#loadjson").val("");   
    $("#preview").val("");   
    $("#importnotes").hide();
});


$("#submit_upload").click(function () {
    "use strict";
    var result = ($("#preview").val()), thisnote = "", x, y;
    JSON.stringify(result);
    result = result.replace(/},{/g, "}~{");
    result = result.split("~");
    for (var i = 0; i < result.length; i+=1) {
        $("#add_note").click();
        thisnote = JSON.parse(result[i]);
        x = document.querySelectorAll(".title");
        x[x.length - 1].innerHTML = thisnote.title;
        y = document.querySelectorAll(".cnt");
        y[y.length - 1].innerHTML = thisnote.cnt;
    }
    $("#cancel_upload").click();
});


$("#reset_notes").click(function () {
    "use strict";
    $("#board").empty();
    newNote();
});


$("#to_top").click(function () {
    "use strict";
    window.scrollTo(0, 0);
});


var thesenotes;

function saveNotes() {
    "use strict";
    thesenotes = gatherNotes();
    localStorage.setItem("thesenotes", thesenotes);
}


$(document).ready(function() {
    
    $("#board").height($(document).height());
    
    $("#add_note").click(newNote);
    
    $(".remove").click(deleteNote);

    thesenotes = localStorage.getItem("thesenotes");
    if (thesenotes !== "") {
        $("#preview").val(thesenotes);
        $("#submit_upload").click();
    } else {
        newNote();
    }
    
    return false;
});