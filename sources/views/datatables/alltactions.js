import {JetView} from "webix-jet";

export default class AllTActionsView extends JetView {
	config () {
		const ip = this.app.config.remoteHOST;
		const _ = this.app.getService("locale")._;
		const dateFormat = webix.Date.dateToStr(this.app.config.dateFormat);
		const theme = this.app.config.theme;
		const ids = this.app.config.ids;
		const configuration = this.app.config.configuration;
		const User = this.app.config.user;
		const access = this.app.config.globals.access;
		const datatable_name = "operations";
		const Type = "archive";

		var _contractor = {};
		var _value = "";

		function setAxelsCount (wagon_number) {
			var l2 = wagon_number[1];
			switch (l2) {
				case "0":
				case "1":
					return 2;
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
				case "7":
					return 4;
				case "8":
					return 6;
				case "9":
					return 8;
			}
		}

		function setWagonType (wagon_number) {
			var l1 = wagon_number[0];
			var l2 = wagon_number[1];
			var l3 = wagon_number[2];
			switch (l1) {
				case "2":
					return _("Covered freight");
				case "3":
					switch (l2) {
						case "0":
						case "1":
							return _("Hopper-dispenser");
						case "2":
						case "3":
						case "4":
						case "5":
							return _("Dumpcar");
						case "6":
							switch (l3) {
								case "4":
									return _("Pplatform");
								case "6":
									return _("Gondola");
								case "7":
									return _("Tank");
								case "8":
									return _("Refrigerated wagon");
								default:
									return _("Wagon")
							}
						case "7":
							switch (l3) {
								case "1":
								case "2":
									return _("Wagon-engine room");
								case "6":
									return _("Caboose for a fish");
								case "7":
									return _("Caboose");
								case "9":
									return _("Tranporter");
								default:
									return _("Wagon")
							}
						default:
							return _("Wagon")
					}

				case "4":
					return _("Pplatform");

				case "5":
					return _("Own wagon");

				case "6":
					return _("Gondola");

				case "7":
					switch (l2) {
						case "0":
							switch (l3) {
								case "0":
									return _("Bunker tank");
								case "1":
								case "2":
								case "3":
									return _("Bunker tank gondola");
								case "5":
								case "6":
									return _("Bunker tank gondola");
								default:
									return _("Tank");
							}
						default:
							return _("Tank")
					}

				case "8":
					switch (l2) {
						case "0":
							return _("Thermos wagon");
						case "1":
							return _("Refrigerated wagon");
						case "3":
							return _("ARW");
						case "4":
							return _("Isothermal freight wagon");
						case "7":
							return _("Isothermal freight wagon");
						case "9":
							return _("Isothermal freight wagon");
						default :
							return _("Isothermal");
					}
				case "9":
					switch (l2) {
						case "1":
							switch (l3) {
								case "8":
									return _("Collective-distributing");
								default:
									return _("Wagon")
							}
						case "2":
							switch (l3) {
								case "8":
									return _("2-tier platform");
								default:
									return _("Covered wagon")
							}
						case "3":
							switch (l3) {
								case "7":
								case "8":
								case "9":
									return _("Tank");
								default:
									return _("Hopper")
							}
						case "4":
							return _("Freight wagon");
						case "5":
							switch (l3) {
								case "9":
									return _("Freight wagon");
								default:
									return _("Hopper")
							}
						case "6":
							switch (l3) {
								case "0":
								case "1":
									return _("Freight wagon for a fish");
								case "3":
								case "4":
								case "5":
									return _("Freight wagon for a livestock");
								case "6":
									return _("Pplatform");
								default:
									return _("Wagon")
							}
						case "7":
							return _("Tank");
						default:
							return _("Wagon")
					}
					return _("Freight wagon");
			}
		}

		function parseWagonNumber (digitInString) {
			var checkSum = 0;
			var l1 = parseInt(digitInString[0]) * 2;
			var l2 = parseInt(digitInString[1]);
			var l3 = parseInt(digitInString[2]) * 2;
			var l4 = parseInt(digitInString[3]);
			var l5 = parseInt(digitInString[4]) * 2;
			var l6 = parseInt(digitInString[5]);
			var l7 = parseInt(digitInString[6]) * 2;
			var l8 = parseInt(digitInString[7]);
			if (l1 >= 10) {
				if (l1 / 10 >= 0) checkSum = checkSum + Math.floor(l1 / 10);
				else checkSum = checkSum + Math.ceil(l1 / 10);
				checkSum = checkSum + (l1 % 10);
			}
			else checkSum = checkSum + l1;
			if (l2 >= 10) {
				if (l2 / 10 >= 0) checkSum = checkSum + Math.floor(l2 / 10);
				else checkSum = checkSum + Math.ceil(l2 / 10);
				checkSum = checkSum + (l2 % 10);
			}
			else checkSum = checkSum + l2;
			if (l3 >= 10) {
				if (l3 / 10 >= 0) checkSum = checkSum + Math.floor(l3 / 10);
				else checkSum = checkSum + Math.ceil(l3 / 10);
				checkSum = checkSum + (l3 % 10);
			}
			else checkSum = checkSum + l3;
			if (l4 >= 10) {
				if (l4 / 10 >= 0) checkSum = checkSum + Math.floor(l4 / 10);
				else checkSum = checkSum + Math.ceil(l4 / 10);
				checkSum = checkSum + (l4 % 10);
			}
			else checkSum = checkSum + l4;
			if (l5 >= 10) {
				if (l5 / 10 >= 0) checkSum = checkSum + Math.floor(l5 / 10);
				else checkSum = checkSum + Math.ceil(l5 / 10);
				checkSum = checkSum + (l5 % 10);
			}
			else checkSum = checkSum + l5;
			if (l6 >= 10) {
				if (l6 / 10 >= 0) checkSum = checkSum + Math.floor(l6 / 10);
				else checkSum = checkSum + Math.ceil(l6 / 10);
				checkSum = checkSum + (l6 % 10);
			}
			else checkSum = checkSum + l6;
			if (l7 >= 10) {
				if (l7 / 10 >= 0) checkSum = checkSum + Math.floor(l7 / 10);
				else checkSum = checkSum + Math.ceil(l7 / 10);
				checkSum = checkSum + (l7 % 10);
			}
			else checkSum = checkSum + l7;
			if (checkSum % 10 >= 0) {
				checkSum = Math.floor(checkSum % 10);
			}
			else checkSum = Math.ceil(checkSum % 10);
			if (l8 === 10 - checkSum) return true
			else return false
		}

		function getContractors () {
			var _methodName = "getContractors";
			webix.ajax().post(
				ip,
				{"method": _methodName, "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							if (data.params.message !== "Nothing to show") {
								_contractor = data.params.contractors;
							} else _contractor = {};
						}
					}
				});
		}

		function setContractor (obj) {
			var _methodName = "setContractor";
			webix.ajax().post(
				ip,
				{
					"method": _methodName,
					"user": User,
					"params": {
						"shortName": obj.shortname,
						"fullName": obj.fullname,
						"inn": obj.inn,
						"kpp": obj.kpp,
						"address": obj.address
					}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "default", text: _(data.params.message)});
							_value = obj.shortname;
						}
					}
				});
		}

		function setCargoName (cargo) {
			var _methodName = "setCargoName";
			webix.ajax().post(
				ip,
				{"method": _methodName, "user": User, "params": {"cargoname": cargo}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "default", text: _(data.params.message)});
						}
					}
				});
		}

		function setDestPoint (cargo) {
			var _methodName = "setDestPoint";
			webix.ajax().post(
				ip,
				{"method": _methodName, "user": User, "params": {"point": cargo}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "default", text: _(data.params.message)});
						}
					}
				});
		}

		function addOperationData (obj) {
			var _methodName = "addOperationData";
			if (_typeof(obj.doc_date) === "object") {
				try {
					var dd = obj.doc_date.getDate();
					var mm = obj.doc_date.getMonth() + 1; //January is 0!
					var yyyy = obj.doc_date.getFullYear();
					if (dd < 10) dd = "0" + dd;
					if (mm < 10) mm = "0" + mm;
					obj.doc_date = yyyy + "-" + mm + "-" + dd;
				}
				catch (e) {
					obj.doc_date = "";
				}
			}
			else if (_typeof(obj.doc_date) === "string")
				if (obj.doc_date.length > 10) {
					obj.doc_date = obj.doc_date.slice(0, 10);
				}
			var _row = {
				id: obj.id,
				write_date: obj.write_date,
				write_time: obj.write_time,
				wagon_number: obj.wagon_number,
				train_number: obj.train_number,
				start_weight: obj.start_weight,
				direction: obj.direction,
				speed: obj.speed,
				doc_start_weight: obj.doc_start_weight,
				brutto: obj.brutto,
				cargo_weight: obj.cargo_weight,
				doc_cargo_weight: obj.doc_cargo_weight,
				capacity: obj.capacity,
				doc_number: obj.doc_number,
				doc_date: obj.doc_date,
				cargo_name: obj.cargo_name,
				truck1_weight: obj.truck1_weight,
                ft_axis_1: obj.ft_axis_1,
                ft_axis_2: obj.ft_axis_2,
                ft_axis_3: obj.ft_axis_3,
                ft_axis_4: obj.ft_axis_4,
                truck2_weight: obj.truck2_weight,
                st_axis_1: obj.st_axis_1,
                st_axis_2: obj.st_axis_2,
                st_axis_3: obj.st_axis_3,
                st_axis_4: obj.st_axis_4,
				truck_diff: obj.truck_diff,
				side_diff: obj.side_diff,
				offset_lengthwise: obj.offset_lengthwise,
				cross_offset: obj.cross_offset,
				sender: obj.sender,
				reciever: obj.reciever,
				transporter: obj.transporter,
				departure_point: obj.departure_point,
				destination_point: obj.destination_point,
				cargo: obj.cargo,
				user: obj.user,
				axels_count: obj.axels_count,
				photo_path: obj.photo_path,
				wagon_type: obj.wagon_type,
				optional1: obj.optional1,
				optional2: obj.optional2,
				optional3: obj.optional3,
				optional4: obj.optional4,
				optional5: obj.optional5,
				autofilling: obj.autofilling,
				type: obj.type,
				weight_type: obj.type
			};
			webix.ajax().post(
				ip,
				{
					"method": _methodName, "user": User,
					"params": {"reweight": 0, "type": Type, row: _row}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$(datatable_name).updateItem(obj.id, obj);
						}
					}
				});
		}

		function ccreate (name, attrs, html) {
			attrs = attrs || {};
			var node = document.createElement(name);

			for (var attr_name in attrs) {
				node.setAttribute(attr_name, attrs[attr_name]);
			}

			if (attrs.style) node.style.cssText = attrs.style;
			if (attrs["class"]) node.className = attrs["class"];
			if (html) node.innerHTML = html;
			return node;
		}

		function _typeof (obj) {
			if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
				_typeof = function (obj) {
					return typeof obj;
				};
			} else {
				_typeof = function (obj) {
					return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
				};
			}

			return _typeof(obj);
		}

		function isArray (obj) {
			return Array.isArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === "[object Array]";
		}

		function create_suggest (config) {
			if (typeof config == "string") return config;
			if (config.linkInput) return config._settings.id;

			if (_typeof(config) == "object") {
				if (isArray(config)) config = {
					data: config
				};
				config.view = config.view || "suggest";
			} else if (config === true) config = {
				view: "suggest"
			};

			var obj = webix.ui(config);
			return obj.config.id;
		}

		function bind (functor, object) {
			return function () {
				return functor.apply(object, arguments);
			};
		}

		webix.editors.myeditor2 = webix.extend({
			_create_suggest: function (config) {
				if (this.config.popup) {
					return this.config.popup.config.id;
				} else if (config) {
					return create_suggest(config);
				} else return this._shared_suggest(config);
			},
			_shared_suggest: function () {
				var e = webix.editors.myeditor2;
				return e._suggest = e._suggest || this._create_suggest(true);
			},
			render: function () {
				var node = ccreate("div", {
					"class": "webix_dt_editor"
				}, "<input type='text' role='combobox' aria-label='" + "ASD" + "'>"); //save suggest id for future reference

				var suggest = this.config.suggest = this._create_suggest(this.config.suggest);

				if (suggest) {
					$$(suggest).linkInput(node.firstChild, true);
					webix._event(node.firstChild, "click", bind(this.showPopup, this));
				}

				return node;
			},
			getPopup: function () {
				return $$(this.config.suggest);
			},
			showPopup: function () {
				var popup = this.getPopup();
				var list = popup.getList();
				var input = this.getInputNode();
				var value = this._initial_value;
				popup.show(input);
				input.setAttribute("aria-expanded", "true");

				if (input) {
					if (list.exists(value)) {
						list.select(value);
						list.showItem(value);
					}
				} else {
					list.unselect();
					list.showItem(list.getFirstId());
				}

				popup._last_input_target = input;
			},
			afterRender: function () {
				this.showPopup();
			},
			setValue: function (value) {
				this._initial_value = value;
				getContractors();
				var xx = this;
				webix.delay(function () {
					if (xx.config.suggest) {
						var sobj = $$(xx.config.suggest);
						var data = _contractor;
						data["Not chosen"] = _("Add contractor");
						if (data) sobj.getList().data.importData(data);
						xx.getInputNode(xx.node).value = sobj.getItemText(value);
					}
				}, null, null, 500);
			},
			getValue: function () {
				var value = this.getInputNode().value;
				var vvalue = this.getInputNode().value;
				if (this.config.suggest) {
					var suggest = $$(this.config.suggest), list = suggest.getList();
					if (value || list.getSelectedId && list.getSelectedId()) {
						value = suggest.getSuggestion(value);
						if (value === "Not chosen") {
							var popupid = "popup" + ids.popupid;
							ids.popupid = ids.popupid + 1;
							var popupbtn1 = "popupbtn1" + ids.popupbtn1;
							ids.popupbtn1 = ids.popupbtn1 + 1;
							var popupbtn2 = "popupbtn2" + ids.popupbtn2;
							ids.popupbtn2 = ids.popupbtn2 + 1;
							var _shortname = "_shortname" + ids._shortname;
							ids._shortname = ids._shortname + 1;
							var _fullname = "_fullname" + ids._fullname;
							ids._fullname = ids._fullname + 1;
							var _inn = "_inn" + ids._inn;
							ids._inn = ids._inn + 1;
							var _kpp = "_kpp" + ids._kpp;
							ids._kpp = ids._kpp + 1;
							var _searcher = "_searcher" + ids._searcher;
							ids._searcher = ids._searcher + 1;
							var _address = "_address" + ids._address;
							ids._address = ids._address + 1;
							newv => this.app.config.ids = ids;
							webix.ui({
								view: "window",
								css: theme,
								id: popupid,
								height: 600,
								width: 500,
								left: 250,
								top: 250,
								move: true,
								head: {
									view: "toolbar", margin: -4, cols: [
										{view: "label", label: _("Contractor creator")},
										{
											view: "icon", icon: "mdi mdi-close", click: function () {
												$$(popupid).hide();
											}
										}]
								},
								body: {
									rows: [
										{
											view: "label",
											label: _("Contractor search (enter name, INN, OGRN or address of organization)"),
											width: 600
										},
										{id: _searcher, view: "text", minWidth: 60, height: 40},
										{view: "label", label: _("Short name")},
										{id: _shortname, view: "text", minWidth: 60, height: 40},
										{view: "label", label: _("Full name")},
										{id: _fullname, view: "text", minWidth: 60, height: 40},
										{view: "label", label: _("INN")},
										{id: _inn, view: "text", minWidth: 60, height: 40, format: "1111"},
										{view: "label", label: _("KPP")},
										{id: _kpp, view: "text", minWidth: 60, height: 40, format: "1111"},
										{view: "label", label: _("Address")},
										{id: _address, view: "text", minWidth: 60, height: 40},
										{
											view: "toolbar", margin: -4, cols: [
												{
													view: "button",
													id: popupbtn2,
													value: _("Save"),
													click: function () {
														var shortName = $$(_shortname).getValue();
														var fullName = $$(_fullname).getValue();
														var inn = $$(_inn).getValue();
														var kpp = $$(_kpp).getValue();
														var address = $$(_address).getValue();
														var obj = {
															"shortname": shortName,
															"fullname": fullName,
															"inn": inn,
															"kpp": kpp,
															"address": address
														};
														setContractor(obj);
														_value = shortName;
														$$(popupid).hide();
													}
												},
												{
													view: "button",
													id: popupbtn1,
													value: _("Close"),
													click: function () {
														$$(popupid).hide();
													}
												}
											]

										}]
								}
							}).show();
							return _value;
						}
						else {
							return vvalue;
						}
					}
				}
				value = vvalue;
			}
		}, webix.editors.text);

		var destinationSuggester = {
			view: "suggest",
			body: {
				dataFeed: ip + "/destination_point/"
			},
			width: 70,
			yCount: 8
		};

		var cargoNameSuggester = {
			view: "suggest",
			body: {
				dataFeed: ip + "/cargo_name/"
			},
			width: 70,
			yCount: 8
		};

		var sender;
		var transporter;
		var reciever;
		var departure_point;
		var destination_point;
		var cargo_name;
		var doc_number;
		var doc_date;
		var edit_archive;

		if (access.change_arch_data) {
			edit_archive = true;
			sender = {id: "sender", header: _("sender"), editor: "myeditor2", adjust: true, liveEdit: true};
			transporter = {id: "transporter", header: _("transporter"), editor: "myeditor2", adjust: true};
			reciever = {id: "reciever", header: _("reciever"), editor: "myeditor2", adjust: true};
			departure_point = {
				id: "departure_point",
				header: _("departure_point"),
				editor: "text",
				suggest: destinationSuggester,
				adjust: true
			};
			destination_point = {
				id: "destination_point",
				header: _("destination_point"),
				editor: "text",
				suggest: destinationSuggester,
				adjust: true
			};
			cargo_name = {
				id: "cargo_name",
				header: _("cargo_name"),
				editor: "text",
				suggest: cargoNameSuggester,
				adjust: true
			};
			doc_number = {id: "doc_number", header: _("doc_number"), editor: "text", adjust: true};
			doc_date = {
				id: "doc_date",
				header: _("doc_date"),
				editor: "date",
				sort: "date",
				format: dateFormat,
				adjust: true
			};
		}
		else {
			edit_archive = false;
			sender = {
				id: "sender",
				header: [_("sender"), {content: "textFilter"}],
				sort: "string",
				view: "list",
				adjust: true,
				liveEdit: true
			};
			transporter = {id: "transporter", header: [_("transporter"), {content: "textFilter"}], adjust: true};
			reciever = {id: "reciever", header: [_("reciever"), {content: "textFilter"}], adjust: true};
			departure_point = {
				id: "departure_point",
				header: [_("departure_point"), {content: "textFilter"}],
				adjust: true
			};
			destination_point = {
				id: "destination_point",
				header: [_("destination_point"), {content: "textFilter"}],
				adjust: true
			};
			cargo_name = {id: "cargo_name", header: [_("cargo_name"), {content: "textFilter"}], adjust: true};
			doc_number = {id: "doc_number", header: _("doc_number"), adjust: true};
			doc_date = {id: "doc_date", header: _("doc_date"), sort: "date", format: dateFormat, adjust: true};
		}

		return {
			view: "datatable",
			id: "operations",
			editable: edit_archive,
			resizeColumn: {headerOnly: true},
			select: "row",
			navigation: true,
			hover: "myhover",
			dragColumn: true,
			columns: [
				{id: "id", header: "#", width: 40, sort: "int"},
				{id: "write_date", header: _("date"), fillspace: 1, minWidth: 90, sort: "date"},
				{id: "write_time", header: _("time"), adjust: true},
				{
					id: "direction", header: "", css: "status", sort: "text", width: 45,
					template: data => {
						let icon = "";
						if (data.direction === true) {
							icon = "arrow-right";
							return `<span class='webix_icon wxi wxi-${icon} ${data.status}'></span>`;
						}
						else if (data.direction === false) {
							icon = "arrow-left";
							return `<span class='webix_icon wxi wxi-${icon} ${data.status}'></span>`;
						}
						else return "";
					}
				},
				{
					id: "train_number",
					header: [_("train_number"), {content: "numberFilter"}],
					sort: "int",
					adjust: "header"
				},
				{
					id: "wagon_number", header: [_("wagon_number"), {content: "numberFilter"}], sort: "int",
					adjust: "header", editor: "text"
				},
				{id: "start_weight", header: _("start_weight"), adjust: true, width: 70},
				{id: "doc_start_weight", header: _("doc_start_weight"), adjust: "header"},
				{id: "brutto", header: _("brutto"), adjust: true},
				{id: "cargo_weight", header: _("cargo_weight"), adjust: true},
				{id: "capacity", header: _("capacity_for_oper_table"), adjust: true},
				{
					id: "overload", header: _("overload"), adjust: true,
					template: data => {
						let icon = "";
						if (data.doc_start_weight !== "" && data.doc_start_weight !== null && data.doc_start_weight !== undefined && !isNaN(data.doc_start_weight)) {
							if (data.capacity !== "" && data.capacity !== null && data.capacity !== undefined && !isNaN(data.capacity)) {
								data.overload = -data.capacity + data.doc_start_weight;
								return data.overload;
							}
							else return "";
						}
						//else if (data.start_weight !== "" && data.start_weight !== null && data.start_weight !== undefined && !isNaN(data.start_weight)) {
						//	if (data.capacity !== "" && data.capacity !== null && data.capacity !== undefined && !isNaN(data.capacity)) {
						//		data.overload = -data.capacity + data.start_weight;
						//		return data.overload;
						//	}
						//	else return "";
						//}
						else return "";
					}
				},
				{id: "doc_cargo_weight", header: _("doc_cargo_weight"), adjust: true},
				doc_number,
				doc_date,
				cargo_name,
                {id: "truck1_weight", header: _("truck1_weight"), adjust: true},
                {id: "ft_axis_1", header: _("ft_axis_1"), adjust: true},
                {id: "ft_axis_2", header: _("ft_axis_2"), adjust: true},
                {id: "ft_axis_3", header: _("ft_axis_3"), adjust: true},
                {id: "ft_axis_4", header: _("ft_axis_4"), adjust: true},
                {id: "truck2_weight", header: _("truck2_weight"), adjust: true},
                {id: "st_axis_1", header: _("st_axis_1"), adjust: true},
                {id: "st_axis_2", header: _("st_axis_2"), adjust: true},
                {id: "st_axis_3", header: _("st_axis_3"), adjust: true},
                {id: "st_axis_4", header: _("st_axis_4"), adjust: true},
				{id: "truck_diff", header: _("truck_diff"), adjust: true},
				{id: "side_diff", header: _("side_diff"), adjust: true},
				{id: "offset_lengthwise", header: _("offset_lengthwise"), adjust: true},
				{id: "cross_offset", header: _("cross_offset"), adjust: true},
				{
					id: "speed", header: _("speed"), adjust: true, template: function (obj) {
						if ((obj.speed > configuration["max_speed_limit"] && obj.speed !== null) || (obj.speed < configuration["min_speed_limit"] && obj.speed !== null)) {
							$$("operations").addRowCss(obj.id, "badRow");
							return "<span style='color:red;font-size: 140%;'>" + obj.speed + "</span>";
						}
						else if (obj.speed === null) return '';
						else return obj.speed;
					}
				},
				sender,
				reciever,
				transporter,
				departure_point,
				destination_point,
				{id: "cargo", header: [_("cargo"), {content: "textFilter"}], adjust: true},
				{id: "axels_count", header: _("axels_count"), adjust: true},
				{id: "photo_path", header: _("photo_path"), adjust: true},
				{id: "wagon_type", header: [_("wagon_type"), {content: "textFilter"}], adjust: true},
				{id: "optional1", header: _("optional1"), adjust: true},
				{id: "optional2", header: _("optional2"), adjust: true},
				{id: "optional3", header: _("optional3"), adjust: true},
				{id: "optional4", header: _("optional4"), adjust: true},
				{id: "optional5", header: _("optional5"), adjust: true},
                {id: "type", header: "type", hidden: true},
				{
					id: "weight_type", header: [_("weight_type"), {content: "selectFilter"}],
					adjust: true, template: function (obj) {
						return _('arch' + obj.type);
					}
				},
				{id: "autofilling", header: _("autofilling"), adjust: true},
				{id: "user", header: _("user"), adjust: true},
				{id: "lastdateedited", header: _("lastdateedited"), adjust: true},
				{id: "lasttimeedited", header: _("lasttimeedited"), adjust: true},
				{id: "lasttimeeditor", header: _("lasttimeeditor"), adjust: true}
			],
			on: {
				"onAfterEditStop": function (state, editor, ignoreUpdate) {
					var row = editor.row;
					try {
						var obj = $$('operations').getItem(row);
					}
					catch (e) {
						console.log(e);
						return false;
					}
				    if (editor.column === "wagon_number") {
						if ((obj.wagon_number + '').length === 0) {
							console.log((obj.wagon_number + '').length);
						} else if (obj.wagon_number > 2147483647 || obj.wagon_number < -2147483648) {
							webix.message({
								text: _("Incorrect wagon number"), type: "error", expire: 5000
							});
							obj.wagon_number = "";
							$$(datatable_name).updateItem(obj.id, obj);
						} else if ((obj.wagon_number + '').length !== 8) {
							webix.message({
								text: _("Incorrect wagon number"), type: "error", expire: 5000
							});
						} else {
							if (!parseWagonNumber(obj.wagon_number + '')) {
								//webix.message({
								//	text: _("Incorrect wagon number"),
								//	type: "error",
								//	expire: 5000
								//});
								//obj.wagon_number = "";
								$$(datatable_name).updateItem(obj.id, obj)
							} else {
								obj.wagon_type = setWagonType(obj.wagon_number + '');
								obj.axels_count = setAxelsCount(obj.wagon_number + '');
								$$(datatable_name).updateItem(obj.id, obj)
							}
						}
					}
					addOperationData(obj);
				}
			}
		};
	}

	init (grid) {
		const _ = this.app.getService("locale")._;
		const list_length = this.app.config.listLength;
		const datatable_name = "operations";

		webix.extend($$(datatable_name), webix.ProgressBar);

		function show_progress_icon (delay) {
			$$(datatable_name).disable();
			$$(datatable_name).showProgress({
				type: "icon",
				delay: delay,
				hide: true
			});
			setTimeout(function () {
				$$(datatable_name).enable();
			}, delay);
		}

		show_progress_icon(1000);
	}
}
