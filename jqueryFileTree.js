// jQuery File Tree Plugin
//
// Originally authored by Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// Usage: $('.fileTreeDemo').fileTree( options, callback )
//
// Options:  root           - root folder to display; default = /
//           script         - location of the serverside AJAX file to use; default = jqueryFileTree.php
//           folderEvent    - event to trigger expand/collapse; default = click
//           expandSpeed    - default = 500 (ms); use -1 for no animation
//           collapseSpeed  - default = 500 (ms); use -1 for no animation
//           expandEasing   - easing function to use on expand (optional)
//           collapseEasing - easing function to use on collapse (optional)
//           multiFolder    - whether or not to limit the browser to one subfolder at a time
//           loadMessage    - Message to display while initial tree loads (can be HTML)
//
// TERMS OF USE
// 
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC. 

/**
 * https://github.com/RoboSparrow/jqueryFileTree, forked from https://github.com/daverogers/jQueryFileTree
 * The plugin is extended by adding an optional directory click callback.
 * Usage:
   $('#<my-id>').fileTree(
     { root: '<path-to-my-root>', script: '<path-to-connector-script>' },
     function(file) { console.log(file); },
     function(directory, selected) { console.log(directory, folderOpened); }	
   ); 
 * The callback returns the currently active directory (in case of closing a folder this would be the parent directory)
 * The second argument of the callback is a boolean indicating if the user just closed or opened a directory
 */

if(jQuery) (function($){

	$.extend($.fn, {
		fileTree: function(options, file, directory) {
			// Default options
			if( options.root			=== undefined ) options.root			= '/';
			if( options.script			=== undefined ) options.script			= '/files/filetree';
			if( options.folderEvent		=== undefined ) options.folderEvent		= 'click';
			if( options.expandSpeed		=== undefined ) options.expandSpeed		= 500;
			if( options.collapseSpeed	=== undefined ) options.collapseSpeed	= 500;
			if( options.expandEasing	=== undefined ) options.expandEasing	= null;
			if( options.collapseEasing	=== undefined ) options.collapseEasing	= null;
			if( options.multiFolder		=== undefined ) options.multiFolder		= true;
			if( options.loadMessage		=== undefined ) options.loadMessage		= 'Loading...';

			$(this).each( function() {

				function showTree(element, dir) {
					$(element).addClass('wait');
					$(".jqueryFileTree.start").remove();
					$.post(options.script, { dir: dir }, function(data) {
						$(element).find('.start').html('');
						$(element).removeClass('wait').append(data);
						$(element).find('UL').attr('data-folder', dir);
						if( options.root == dir ) $(element).find('UL:hidden').show(); else $(element).find('UL:hidden').slideDown({ duration: options.expandSpeed, easing: options.expandEasing });
						bindTree(element);
					});
				}

				function bindTree(element) {
					$(element).find('LI A').on(options.folderEvent, function() {
						if( $(this).parent().hasClass('directory') ) {
							if( $(this).parent().hasClass('collapsed') ) {
								// Expand
								if( !options.multiFolder ) {
									$(this).parent().parent().find('UL').slideUp({ duration: options.collapseSpeed, easing: options.collapseEasing });
									$(this).parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
								}
								$(this).parent().find('UL').remove(); // cleanup
								showTree( $(this).parent(), escape($(this).attr('rel').match( /.*\// )) );
								$(this).parent().removeClass('collapsed').addClass('expanded');
								folderSelected($(this), true);
							} else {
								// Collapse
								$(this).parent().find('UL').slideUp({ duration: options.collapseSpeed, easing: options.collapseEasing });
								$(this).parent().removeClass('expanded').addClass('collapsed');
								folderSelected($(this), false);
							}

						} else {
							file($(this).attr('rel'));
						}
						return false;
					});
					// Prevent A from triggering the # on non-click events
					if( options.folderEvent.toLowerCase != 'click' ) $(element).find('LI A').on('click', function() { return false; });
				}
				
				/**
				 * fire the directory click event if assigned
				 * @param object $obj: jquery element (folder link)
				 * @param boolean folderOpened: indicates event: folder subtree was closed or opened by user
				 */
				function folderSelected($obj, folderOpened){	
					if(typeof(directory) !== 'function' ){
						return;
					}
					if(folderOpened){
						var activeDirectory = $obj.attr('rel');
					}else{
						var $parent = $obj.parent().parent();
						var activeDirectory = $parent.parent().find('UL').attr('data-folder');//parent
					}
					directory(activeDirectory, folderOpened);
				}//f
				
				// Loading message
				$(this).html('<ul class="jqueryFileTree start"><li class="wait">' + options.loadMessage + '<li></ul>');
				// Get the initial file list
				showTree( $(this), escape(options.root) );
			});
		}
	});

})(jQuery);