(function ($) {
    $.fn.asTagsInput = function (options) {
        var defaults = {
            wholeInputTemplate: function (i) {
                // surround the input with a div to group all items of the tag-input
                // i: the input element
                // return the input-elements container
                var inputContainer = $("<div/>").addClass("whole-tags-input");
                inputContainer.insertBefore(i);
                i.appendTo(inputContainer);
                return inputContainer;
            },
            activeTagsWrapperTemplate: function (c) {
                // return the element to wrap all active tags
                return $("<div/>").addClass("activeTags");
            },
            singleTagShowTemplate: function (c, rt, term) {
                // crete a single term element/s
                // c: the input-elements container
                // rt: the single-tag remove template
                // term: the tag text
                // return an element containing the tag and its remove
                var termEle = $("<span/>").text(term);
                var remove = rt(c, term);
                var singleTagWrapper = $("<div/>").addClass("tag").attr("term", term);
                return singleTagWrapper.append(termEle, remove);
            },
            singleTagRemoveTemplate: function (c, term) {
                // crete element/s to remove a tag
                // c: the input-elements container
                // rt: the single-tag remove template
                // term: the tag text
                // return an element containing the tag remove
                return $("<a/>").addClass("removeTag").attr("href", "#").text("");
            },
            getRemoveElements: function (c) {
                // c: the input-elements container
                // return all tag-remove elements
                return $("a.removeTag", c);
            },
            tagRemoveBehavior: function (c, removeElement, callbacks) {
                // add behavior to all tag-remove 
                // c: the input-elements container
                return removeElement.click(function (eo) {
                    var stc = $(this).closest("div.tag");
                    var term = stc.attr("term");
                    stc.remove();

                    callbacks.fire(c, term);
                    return false;
                });
            },
            singleTagInputTemplate: function () {
                // crete input-element to add a new tag
                // return the input-element
                return $("<input/>").addClass("newTag").attr("type", "text").attr("placeholder", "add tag").val("");
            },
            tagInputBehavior: function (c, callbacks) {
                return $("input.newTag", c).keypress(function (e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 13 || code == ",".charCodeAt(0)) {
                        var term = $(this).val().trim();
                        if (term.length > 0) {
                            callbacks.fire(c, term);
                        }
                        $(this).val("");
                        return false;
                    }
                    return true;
                });
            },
            wordsSplitter: function (iv) {
                // iv: the original input value
                // return an array of each single word
                var terms = [];
                $.each(iv.split(','), function (i, v) {
                    var trimmedValue = v.trim();
                    if (trimmedValue.length > 0) {
                        terms.push(v.trim());
                    }
                });
                return terms;
            },
            getActiveTags: function (c) {
                // extract active tags
                // c: the input-elements container
                // return an array of each single word
                var terms = [];
                $("div.tag", c).each(function (i, v) {
                    var term = $(this).attr("term");
                    terms.push(term);
                });
                return terms;
            },
            createInputValueString: function (words) {
                // words: array of words
                // return the string representing the value of the original input
                return words.join(", ");
            },
            onTagRemoved: function (c, term) {
                // callback
            },
            onTagAdded: function (c, term) {
                // callback
            }
        };

        var options = $.extend(defaults, options);

        return this.each(function () {
            var declaredInput = $(this);
            var container = options.wholeInputTemplate(declaredInput);
            var words = options.wordsSplitter(declaredInput.val());
            var activeTagsWrapper = options.activeTagsWrapperTemplate(container);
            $.each(words, function (i, w) {
                activeTagsWrapper.append(options.singleTagShowTemplate(container, options.singleTagRemoveTemplate, w));
            });
            container.append(activeTagsWrapper);
            container.append(options.singleTagInputTemplate());

            var removeCallbacks = $.Callbacks();
            removeCallbacks.add(function (c, term) {
                var terms = options.getActiveTags(container);
                var newValue = options.createInputValueString(terms);
                declaredInput.val(newValue);
            });
            removeCallbacks.add(options.onTagRemoved);
            options.tagRemoveBehavior(container, options.getRemoveElements(container), removeCallbacks);

            var newTagCallbacks = $.Callbacks();
            newTagCallbacks.add(function (c, term) {
                // insert the new tag element with its callbacks
                var newTerm = term;
                var newsTagElement = options.singleTagShowTemplate(c, options.singleTagRemoveTemplate, newTerm);
                activeTagsWrapper.append(newsTagElement);
                var removeElement = options.getRemoveElements(newsTagElement);
                options.tagRemoveBehavior(c, removeElement, removeCallbacks);
            });
            newTagCallbacks.add(function (c, term) {
                // reset the declaredInput value
                var terms = options.getActiveTags(container);
                var newValue = options.createInputValueString(terms);
                declaredInput.val(newValue);
            });
            newTagCallbacks.add(options.onTagAdded);
            options.tagInputBehavior(container, newTagCallbacks);
        });
    };
})(jQuery);