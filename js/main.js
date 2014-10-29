// window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
//   alert(errorMsg);
//   return false;
// }

jQuery(function ($) {

    var util = {
        store: function (namespace, data) {
            if (arguments.length > 1) {
                return localStorage.setItem(namespace, JSON.stringify(data));
            } else {
                var store = localStorage.getItem(namespace);
                return (store && JSON.parse(store)) || [];
            }
        }
    };

    var Product = function(obj){
        var self = this;

        self.id = obj.id;
        self.title = obj.title;
        self.price = obj.price;
        self.quantity = obj.quantity;
        self.cost = 0;
        
        self.calculateCost = function() {
            self.cost = (self.price * self.quantity);
            return self.cost;
        };

        return self;
    };

    var App = {
        init: function () {
            this.products = [];
            this.cacheElements();
            this.bindEvents();

            var listLength = this.$productsList.length;
            for(var i=0; i<listLength; i++) {
                this.create(i, this.$productsList[i]);
            }

            this.renderTotal();      
        },

        cacheElements: function () {
            this.$main = $('#main');
            this.$productsList = this.$main.find('#productsList li.product');
            this.$subtotal = this.$main.find('#subtotal');
            this.$vat = this.$main.find('#vat');
            this.$total = this.$main.find('#total');
            this.$form = this.$main.find('#cartForm');
        },

        bindEvents: function () {
            var list = this.$productsList;
            list.on('click', '.btn-remove', this.remove.bind(this));
            list.on('change', '.input-product-quantity', this.editProductQ.bind(this));
            list.on('click', '.add', this.changeQ.bind(this, 1));
            list.on('click', '.substract', this.changeQ.bind(this, -1));
            this.$form.on('submit', this.submit.bind(this));
        },

        submit: function (e) {

            e.preventDefault();

            $.ajax({
                url: "/",
                data: {
                    'products': this.products
                },
                type: 'POST'
            }).done(function() {
                alert("thank you")
            }).fail(function(){
                alert("something went wrong")
            });
        },

        create: function (id, el) {
            this.products.push( new Product({
                id: id,
                title: $(el).find('.product-name').text(),
                price: parseFloat($(el).find('.product-price').text().replace('£', '')),
                quantity: parseInt($(el).find('.input-product-quantity').val(), 10),
                cost: 0
            }));

            var pr_cost = this.products[id].calculateCost();
            $(el).find('.product-cost').text('£'+pr_cost.toFixed(2));

            $(el).data('id', id);
            $(el).data('id');

        },

        remove: function (e) {
            e.preventDefault();
            var id = parseInt($(e.currentTarget).data('id'));
            var index = this.getProductListIndexById(id);

            this.products.splice(index, 1);

            $(e.target).parents('li.product').remove();
            this.renderTotal();
            return true;
        },

        renderTotal: function() {
            this.subtotal = 0;
            var listLength = this.products.length;
            for(var i=0; i<listLength; i++) {
                this.subtotal += this.products[i].cost;
            }
            this.$subtotal.text(this.subtotal.toFixed(2));
            this.$vat.text((this.subtotal*0.2).toFixed(2));
            this.$total.text((this.subtotal + this.subtotal*0.2).toFixed(2));
        },

        getProductListIndexById: function(id) {
            var listLength = this.products.length;
            for(var i=0; i<listLength; i++) {
                if(this.products[i].id == id) {
                    return i;
                };
            }
        },

        editProductQ: function(e) {
            var $product_el = $(e.currentTarget).parents('.product');
            var id = $product_el.data('id');
            var index = this.getProductListIndexById(id);

            this.products[index].quantity = parseInt(e.currentTarget.value, 10);
            var pr_cost = this.products[index].calculateCost();

            $product_el
                .find('.product-cost').text('£'+pr_cost.toFixed(2));

            this.renderTotal();
        },

        changeQ: function(add_n, e) {
            var $product_el = $(e.currentTarget).parents('.product');
            var $input = $product_el.find('.input-product-quantity');
            var current_val = parseInt($input.val(), 10);
            var new_v = current_val + add_n;
            if (new_v >=1 && new_v <=10) {
                $input.val(current_val + add_n);
                $input.trigger("change");
            }
        }
    };


    if (Modernizr.inputtypes.number) {
        $('.product-qunatity-cont').addClass('invisible');
    }

    App.init();
});