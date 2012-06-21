//here you place the ids of every element you want.
	var ids=new Array('newsletter_section','mobile_section','rss_section','tastebook_section');
	
	function switchid(id){	
		hideallids();
		showdiv(id);
	}
	function hideallids(){
	//loop through the array and hide each element by id
		for (var i=0;i<ids.length;i++){
			hidediv(ids[i]);
		}		  
	}
	function hidediv(id) {
	//safe function to hide an element with a specified id
		if (document.getElementById) { // DOM3 = IE5, NS6
			document.getElementById(id).style.display = 'none';
		} else {
			if (document.layers) { // Netscape 4
				document.id.display = 'none';
			} else { // IE 4
				document.all.id.style.display = 'none';
			}
		}
	}
	function showdiv(id) {
	//safe function to show an element with a specified id
		  
		if (document.getElementById) { // DOM3 = IE5, NS6
			document.getElementById(id).style.display = 'block';
		} else {
			if (document.layers) { // Netscape 4
				document.id.display = 'block';
			} else { // IE 4
				document.all.id.style.display = 'block';
			}
		}
	}
	function hideMessages() {
		document.getElementById("letter_message1").style.display="none";
		document.getElementById("letter_message2").style.display="none";
		document.getElementById("letter_message3").style.display="none";
	}
	function hideNewsletterMessage() {
		 var mylist=document.getElementById("newsletter_content");
		 var chkBox;
		 var chkCounter = 0;
		 var newsletterCount = document.newslettersForm.newsletter;
		for (var j= 0; j < newsletterCount.length; j++) {
                if (newsletterCount[j].checked) {
			chkBox = newsletterCount[j];
			jQuery(chkBox.parentNode).css('display','none');
			chkCounter++;
		}
            }
	  
	 //check whether the entire newsletter content is displayed
	 if(chkCounter != newsletterCount.length){
		jQuery('#see_all').css('display','block');
	 }else{
		jQuery('#signup_header').css('display','none');
		jQuery('#newslettersForm').css('display','none');	
	 }
	
        document.getElementById("letter_message1").style.display="none";
        document.getElementById("newsletter_content").style.display="block";
       /* document.getElementById("learnMore").style.display="block"; */
		document.getElementById("letter_message2").style.display="none";
		document.getElementById("letter_message3").style.display="none";
	}
	function submitEnterNews(evt) { 
		if ((evt.which && evt.which == 13) || (evt.keyCode && evt.keyCode == 13)) {
			signUpNewsletters();
		}
	}
	jQuery(document).ready(function(){
		jQuery('#newslettersForm').submit(function() {
		signUpNewsletters();
		return false;
		});
	});