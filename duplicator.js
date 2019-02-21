/*
 ----------------------------------
 jQuery Duplicator
 ----------------------------------
 @Author: Ashley Needham
 @Description: A plugin for replicating sections of a form to allow infinite fields / rows to be added by the end user
 @Version: 1.1
 @License: MIT
 */
;
(function ($) {
    "use strict";
    $.fn.duplicator = function (params) {
        // Merge Params
        params = $.extend({
            addButtonLocation: '',
            removeButtonLocation: '',
            duplicateLocation: '',
            addButtonClass: '',
            removeButtonClass: '',
            addButtonText: 'Add',
            removeButtonText: 'Remove',
            afterDuplicate: function () { return undefined; },
            afterRemove: function () { return undefined; },
            confirmRemoval: false,
            removalMessage: 'Are you sure?'
        }, params);

        // Default Button HTML
        var addButtonHtml = '<button class="duplicator_add_button ' + params.addButtonClass + '">' + params.addButtonText + '</button>',
            removeButtonHtml = '<button class="duplicator_remove_button ' + params.removeButtonClass + '">' + params.removeButtonText + '</button>',
            output = [];

        /**
         * Removes the item
         * @param  {object}   item     the item to be removed
         */
        $.fn.duplicator.remove = function (item) {
            var duplicatorParams = item.parent().data('duplicatorParams');
            if (duplicatorParams.confirmRemoval) {
                if (!confirm(duplicatorParams.removalMessage)) {
                    return false;
                }
            }
            $(item).remove();
            duplicatorParams.afterRemove();
        };

        // Initiate duplicator
        this.each(function () {

            // Store Params
            $(this).data('duplicatorParams', params);

            // Store Donar
            var donar = $(this).children(':last-child')[0];
            this.donar = donar;
            $(donar).addClass('jquery-duplicator-donar');

            // Store Destination
            if (params.duplicateLocation !== '') {
                this.destination = params.duplicateLocation;
            } else {
                this.destination = $(this);
            }

            // Add button
            if (params.addButtonLocation !== '') {
                this.addButton = $(addButtonHtml).appendTo(params.addButtonLocation);
            } else {
                this.addButton = $(addButtonHtml).insertAfter($(this));
            }
            this.addButton[0].duplicatorParent = $(this)[0];

            this.addButton.click(function (e) {
                e.preventDefault();
                $(this.duplicatorParent).duplicate(params.afterDuplicate);
            });

            // Remove button
            $(this).children().each(function () {
                var removeButton;
                if (params.removeButtonLocation !== '') {
                    removeButton = $(removeButtonHtml).appendTo($(this).find(params.removeButtonLocation));
                } else {
                    removeButton = $(removeButtonHtml).appendTo($(this));
                }
                removeButton.data('remove_what', $(this)).click(function (e) {
                    e.preventDefault();
                    $.fn.duplicator.remove($(this).data('remove_what'), params.afterRemove);
                });
            });

            // Hide this item
            $(this.donar).hide();

            // On form submit, remove the hidden item
            $(this).closest('form').submit(function () {
                $(donar).remove();
            });
            output.push(this);
        });

        // Returns the iterated elements in an array
        return output;
    };

    /**
     * Creates a clone of the donar and places it in the designated space
     * @return {object/array} Returns a simple object containing the cloned item if only one instance or an array of objects if multiple
     */
    $.fn.duplicate = function () {
        var output = [];
        this.each(function () {
            var clone = $(this.donar).clone().appendTo(this.destination).show().removeClass('jquery-duplicator-donar');
            clone.find('.duplicator_remove_button').data('remove_what', clone).click(function (e) {
                e.preventDefault();
                $.fn.duplicator.remove($(this).data('remove_what'));
            });
            clone.parent().data('duplicatorParams').afterDuplicate(clone);

            output.push(clone);
        });

        return (output.length === 1) ? output[0] : output;
    };
})(jQuery);
