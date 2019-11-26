import {JetView} from "webix-jet";

export default class DynamicTActionsView extends JetView {
  config () {
    const ip = this.app.config.remoteHOST;
    const _ = this.app.getService("locale")._;
    const dateFormat = webix.Date.dateToStr(this.app.config.dateFormat);
    const theme = this.app.config.theme;
    const ids = this.app.config.ids;
    const configuration = $$('mainTop').$scope.app.config.configuration;
    const User = this.app.config.user;
    const access = this.app.config.globals.access;
    const Type = "dynamic";
    const hideOptions = this.app.config.hideOptions["dynamic"];
    const WeightType = _("dynamic");
    const datatable_name = "dynamic_operations";

    var _contractor = {};
    var _value = "";
    var rightColsToShowIfAccess = 2;
    if (!access.adding_arch_data) rightColsToShowIfAccess = 1;

    function LIMITY (weight) {
      var A, B, C, D, i;
      var LIMTABY = [[10000, 30000, 50000, 55000, 67000, 68000], [410, 290, 200, 150, 120, 100]];
      if (weight <= LIMTABY[0][0]) return LIMTABY[1][0];

      if (weight >= LIMTABY[0][4]) return LIMTABY[1][5];

      for (i = 1; i <= 4; i++) {
        if (weight < LIMTABY[0][i]) {
          A = LIMTABY[1][i];
          B = LIMTABY[1][i - 1];
          C = LIMTABY[0][i];
          D = LIMTABY[0][i - 1];
          break
        }
      }
      return ((weight - D) * ((A - B) / (C - D))) + B;
    }

    function LIMITX (weight) {
      var A, B, C, D, i;
      var LIMTABX = [[10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 62000, 67000, 70000, 71000],
        [3000, 2480, 2230, 2070, 1970, 1890, 1840, 1800, 1700, 1330, 860, 690, 300, 110, 100]];
      if (weight <= LIMTABX[0][0]) return LIMTABX[1][0];
      if (weight >= LIMTABX[0][13]) return LIMTABX[1][14];

      for (i = 1; i <= 13; i++) {
        if (weight < LIMTABX[0][i]) {
          A = LIMTABX[1][i];
          B = LIMTABX[1][i - 1];
          C = LIMTABX[0][i];
          D = LIMTABX[0][i - 1];
          break;
        }
      }
      return ((weight - D) * ((A - B) / (C - D))) + B;
    }

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
              }
              else _contractor = {};
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

    function setCargo (cargo) {
      var _methodName = "setCargo";
      webix.ajax().post(
        ip,
        {"method": _methodName, "user": User, "params": {"cargo": cargo}},
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

    function setWeight (obj) {
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
        direction: obj.direction,
        write_date: obj.write_date,
        write_time: obj.write_time,
        wagon_number: obj.wagon_number,
        train_number: obj.train_number,
        start_weight: obj.start_weight,
        doc_start_weight: obj.doc_start_weight,
        brutto: obj.brutto,
        cargo_weight: obj.cargo_weight,
        doc_cargo_weight: obj.doc_cargo_weight,
        overload: obj.overload,
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
        speed: obj.speed,
        transporter: obj.transporter,
        departure_point: obj.departure_point,
        destination_point: obj.destination_point,
        cargo: obj.cargo,
        user: User,
        axels_count: obj.axels_count,
        photo_path: obj.photo_path,
        wagon_type: obj.wagon_type,
        optional1: obj.optional1,
        optional2: obj.optional2,
        optional3: obj.optional3,
        optional4: obj.optional4,
        optional5: obj.optional5,
        autofilling: obj.autofilling,
        type: Type,
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
              $$('dynamic_operations').updateItem(obj.id, obj);
            }
          }
        });
    }

    function updateWeight (obj, idToDel) {
      console.log("CALL OF UPDATEWEIGHT");
      var _methodName = "updateWeight";
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
      webix.ajax().post(
        ip,
        {
          "method": _methodName, "user": User, "params": {
            "type": Type, "idToDel": idToDel,
            row: {
              id: obj.id,
              direction: obj.direction,
              write_date: obj.write_date,
              write_time: obj.write_time,
              train_number: obj.train_number,
              wagon_number: obj.wagon_number,
              start_weight: obj.start_weight,
              doc_start_weight: obj.doc_start_weight,
              brutto: obj.brutto,
              cargo_weight: obj.cargo_weight,
              doc_cargo_weight: obj.doc_cargo_weight,
              overload: obj.overload,
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
              speed: obj.speed,
              transporter: obj.transporter,
              departure_point: obj.departure_point,
              destination_point: obj.destination_point,
              cargo: obj.cargo,
              user: User,
              axels_count: obj.axels_count,
              photo_path: obj.photo_path,
              wagon_type: obj.wagon_type,
              optional1: obj.optional1,
              optional2: obj.optional2,
              optional3: obj.optional3,
              optional4: obj.optional4,
              optional5: obj.optional5,
              autofilling: obj.autofilling
            }
          }
        },
        function (text, xml, xhr) {
          var data = JSON.parse(text);
          console.log(data);
          if (data.method === _methodName) {
            if (data.answer === "ok") {
              console.log("REMOVING ROW: " + idToDel);
              $$('dynamic_operations').remove(idToDel);
              console.log("UPDATING ROW: " + obj.id);
              $$('dynamic_operations').updateItem(obj.id, obj);
              setWeight(obj);
            }
          }
        });
    }

    function delWeight (id) {
      var _methodName = "delWeight";
      webix.ajax().post(
        ip,
        {"method": _methodName, "user": User, "params": {"type": Type, "id": id}},
        function (text, xml, xhr) {
          var data = JSON.parse(text);
          if (data.method === _methodName) {
            if (data.answer === "ok") {
              $$('dynamic_operations').remove(id);
              webix.message(_("Deleted"));
            }
          }
        });
    }

    function setArchive (id) {
      var _methodName = "setArchive";
      webix.ajax().post(
        ip,
        {
          "method": _methodName, "user": User, "params": {
            "type": Type,
            "id": id
          }
        },
        function (text, xml, xhr) {
          var data = JSON.parse(text);
          console.log(data);
          if (data.method === _methodName) {
            if (data.answer === "ok") {
              var obj = $$('dynamic_operations').getItem(id);
              $$('dynamic_operations').remove(id);
              webix.message(_("Ssaved"));
              setCargo(obj.cargo);
              setDestPoint(obj.departure_point);
              setDestPoint(obj.destination_point);
              setCargoName(obj.cargo_name);
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

    webix.editors.myeditor3 = webix.extend({
      _create_suggest: function (config) {
        if (this.config.popup) {
          return this.config.popup.config.id;
        } else if (config) {
          return create_suggest(config);
        } else return this._shared_suggest(config);
      },
      _shared_suggest: function () {
        var e = webix.editors.myeditor3;
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

    var cargoSuggester = {
      view: "suggest",
      body: {
        dataFeed: ip + "/cargo/"
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

    var wagonNumberField = {};
    if (access.change_wagon_number)
      wagonNumberField = {
        id: "wagon_number",
        header: _("wagon_number"),
        adjust: "header",
        editor: "text",
        format: function (value) {return webix.i18n.intFormat(value);},
        editParse: function (value) {
          return webix.Number.parse(value, {
            groupSize: webix.i18n.groupSize
          });
        },
        editFormat: function (value) {return webix.i18n.intFormat(value);},
        template: function (obj) {
          if (obj.axels_count === undefined || obj.axels_count === null || obj.axels_count === '') {
            if (obj.wagon_number === null || obj.wagon_number === undefined) return '';
            else return "<span style='color:red;font-size: 140%;'>" + obj.wagon_number + "</span>";
          }
          else return obj.wagon_number;
        }
      };
    else
      wagonNumberField = {
        id: "wagon_number", header: _("wagon_number"), adjust: "header",
        template: function (obj) {
          if (obj.axels_count === undefined || obj.axels_count === null || obj.axels_count === '') {
            if (obj.wagon_number === null || obj.wagon_number === undefined) return '';
            else return "<span style='color:red;font-size: 140%;'>" + obj.wagon_number + "</span>";
          }
          else return obj.wagon_number;
        }
      };

    if (access.cancel_weighting) var countLeftCols = 1;
    else var countLeftCols = 0;

    return {
      view: "datatable",
      undo: "true",
      id: datatable_name,
      editable: true,
      resizeColumn: {headerOnly: true},
      select: "row",
      drag: false,
      navigation: true,
      hover: "myhover",
      dragColumn: true,
      columns: [
        {
          id: "del", header: "", width: 50, hidden: !access.cancel_weighting,
          template: function (obj) {
            var html = "<div class='del_element" + "'>";
            return html + "</div>";
          }
        },
        {id: "id", header: "#", width: 40, sort: "int"},
        {id: "write_date", header: _("date"), fillspace: 1, minWidth: 90, sort: "date", format: dateFormat},
        {id: "write_time", header: _("time"), adjust: true},
        {
          id: "direction", header: "", css: "status", sort: "text", width: 45,
          template: data => {
            let icon = "";
            if (data.direction === true)
              icon = "arrow-right";
            else
              icon = "arrow-left";
            return `<span class='webix_icon wxi wxi-${icon} ${data.status}'></span>`;
          }
        },
        {id: "train_number", header: _("train_number"), adjust: "header", editor: "text"},
        wagonNumberField,
        {
          id: "start_weight", header: _("start_weight"), adjust: true, width: 70,
          template: function (obj) {
            if (obj.start_weight >= obj.capacity && obj.start_weight !== null) {
              $$(datatable_name).addRowCss(obj.id, "badRow");
              return "<span style='color:red;font-size: 140%;'>" + obj.start_weight + "</span>";
            }
            else if (obj.capacity - obj.start_weight <= 10 && obj.start_weight !== null) {
              $$(datatable_name).addRowCss(obj.id, "warnRow");
              return "<span style='color:yellow;font-size: 140%;'>" + obj.start_weight + "</span>";
            }
            else {
              if (obj.start_weight === null || obj.start_weight === undefined) return '';
              else return obj.start_weight;
            }
          }
        },
        {id: "doc_start_weight", header: _("doc_start_weight"), adjust: "header"},
        {
          id: "brutto", header: _("brutto"), adjust: true,
          template: function (obj) {
            if ((obj.cargo_weight || obj.doc_cargo_weight) && obj.start_weight && obj.doc_start_weight && obj.brutto && (obj.capacity - obj.cargo_weight) > 10 && obj.side_diff < configuration["side_diff"] && obj.offset_lengthwise < configuration["offset_lengthwise"] && obj.cross_offset < configuration["cross_offset"]) {
              $$(datatable_name).addRowCss(obj.id, "goodRow");
            }
            return obj.brutto;
          }
        },
        {id: "cargo_weight", header: _("cargo_weight"), adjust: true},
        {
          id: "doc_cargo_weight", header: _("doc_cargo_weight"), adjust: true,
          editor: "text", format: function (value) {return webix.i18n.intFormat(value);},
          editParse: function (value) {
            return webix.Number.parse(value, {
              groupSize: webix.i18n.groupSize,
              groupDelimiter: webix.i18n.groupDelimiter
            });
          },
          editFormat: function (value) {return webix.i18n.intFormat(value);}
        },
        {
          id: "capacity", header: _("capacity_for_oper_table"), adjust: true,
          editor: "text", format: function (value) {return webix.i18n.intFormat(value);},
          editParse: function (value) {
            return webix.Number.parse(value, {
              groupSize: webix.i18n.groupSize,
              groupDelimiter: webix.i18n.groupDelimiter
            });
          },
          editFormat: function (value) {return webix.i18n.intFormat(value);}
        },
        {
          id: "overload", header: _("overload"), adjust: true,
          template: data => {
            if (data.doc_start_weight !== "" && data.doc_start_weight !== null && data.doc_start_weight !== undefined && !isNaN(data.doc_start_weight)) {
              if (data.capacity !== "" && data.capacity !== null && data.capacity !== undefined && !isNaN(data.capacity)) {
                data.overload = -data.capacity + data.doc_start_weight;
                return "<span style='color:red;font-size: 140%;'>" + data.overload + "</span>";
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
        {
          id: "doc_number", header: _("doc_number"), editor: "text", adjust: true
        },
        {
          id: "doc_date", header: _("doc_date"),
          editor: "date", sort: "date", format: dateFormat, adjust: true
        },
        {
          id: "cargo_name", header: _("cargo_name"),
          editor: "text", suggest: cargoNameSuggester, adjust: true
        },
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
        {
          id: "truck_diff", header: _("truck_diff"),
          adjust: "header", math: "[$r,truck2_weight] - [$r,truck1_weight]",
          template: function (obj) {
            var result = obj.truck_diff;
            if (result === null) return '';
            else if (result === 0) return 0;
            else if (result < 0) result = -result;
            return result;
          }
        },
        {
          id: "side_diff", header: _("side_diff"),
          adjust: "header", template: function (obj) {
            if (obj.side_diff >= configuration["side_diff"]) {
              $$(datatable_name).addRowCss(obj.id, "badRow");
              if (obj.side_diff < 0) obj.side_diff = -obj.side_diff;
              return "<span style='color:red;font-size: 140%;'>" + obj.side_diff + "</span>";
            }
            else {
              if (obj.side_diff < 0) obj.side_diff = -obj.side_diff;
              return obj.side_diff;
            }
          }
        },
        {
          id: "offset_lengthwise", header: _("offset_lengthwise"),
          adjust: true, template: function (obj) {
            if (obj.offset_lengthwise < 0) obj.offset_lengthwise = -obj.offset_lengthwise;
            if (configuration.gost) {
              var limitx;
              var brutto = 0;

              if (obj.brutto !== "" || obj.brutto !== null || obj.brutto !== undefined) brutto = obj.brutto;
              if (brutto > 0) {
                limitx = LIMITX(brutto);
                //console.log(limitx);
              }
              else limitx = LIMITX(0);
              if (obj.offset_lengthwise >= limitx) {
                $$(datatable_name).addRowCss(obj.id, "badRow");
                return "<span style='color: red; font-size: 140%;'>" + obj.offset_lengthwise + "</span>";
              }
              else {
                return obj.offset_lengthwise;
              }
            }
            else {
              if (obj.offset_lengthwise >= configuration["offset_lengthwise"] && obj.offset_lengthwise) {
                $$(datatable_name).addRowCss(obj.id, "badRow");
                return "<span style='color: red; font-size: 140%;'>" + obj.offset_lengthwise + "</span>";
              }
              else {
                return obj.offset_lengthwise;
              }
            }
          }
        },
        {
          id: "cross_offset", header: _("cross_offset"),
          adjust: true, template: function (obj) {
            if (obj.cross_offset < 0) obj.cross_offset = -obj.cross_offset;
            if (configuration.gost) {
              var limity;
              var brutto = 0;

              if (obj.brutto !== "" || obj.brutto !== null || obj.brutto !== undefined) brutto = obj.brutto;
              if (brutto > 0) {
                limity = LIMITY(brutto);
                //console.log(limity);
              }
              else limity = LIMITY(0);
              if (obj.cross_offset >= limity) {
                $$(datatable_name).addRowCss(obj.id, "badRow");
                return "<span style='color: red; font-size: 140%;'>" + obj.cross_offset + "</span>";
              }
              else {
                return obj.cross_offset;
              }
            }
            else {
              if (obj.cross_offset >= configuration["cross_offset"] && obj.cross_offset) {
                $$(datatable_name).addRowCss(obj.id, "badRow");
                return "<span style='color: red; font-size: 140%;'>" + obj.cross_offset + "</span>";
              }
              else {
                return obj.cross_offset;
              }
            }
          },
        },
        {
          id: "speed", header: _("speed"), adjust: true, template: function (obj) {
            if (obj.speed > configuration["max_speed_limit"] || obj.speed < configuration["min_speed_limit"]) {
              $$(datatable_name).addRowCss(obj.id, "badRow");
              return "<span style='color:red;font-size: 140%;'>" + obj.speed + "</span>";
            }
            else return obj.speed;
          }
        },
        {
          id: "sender", header: _("sender"),
          editor: "myeditor3", adjust: true, liveEdit: true
        },
        {
          id: "reciever", header: _("reciever"),
          editor: "myeditor3", adjust: true
        },
        {
          id: "transporter", header: _("transporter"),
          editor: "myeditor3", adjust: true
        },
        {
          id: "departure_point", header: _("departure_point"),
          editor: "text", suggest: destinationSuggester, adjust: true
        },
        {
          id: "destination_point", header: _("destination_point"),
          editor: "text", suggest: destinationSuggester, adjust: true
        },
        {
          id: "cargo", header: _("cargo"), name: "cargo",
          editor: "text", suggest: cargoSuggester, adjust: true
        },
        {id: "axels_count", header: _("axels_count"), adjust: true},
        {id: "photo_path", header: _("photo_path"), adjust: true},
        {id: "wagon_type", header: _("wagon_type"), editor: "text", adjust: true},
        {id: "optional1", header: _("optional1"), editor: "text", adjust: true},
        {id: "optional2", header: _("optional2"), editor: "text", adjust: true},
        {id: "optional3", header: _("optional3"), editor: "text", adjust: true},
        {id: "optional4", header: _("optional4"), editor: "text", adjust: true},
        {id: "optional5", header: _("optional5"), editor: "text", adjust: true},
        {id: "lastdateedited", header: _("lastdateedited"), adjust: true},
        {id: "lasttimeedited", header: _("lasttimeedited"), adjust: true},
        {id: "lasttimeeditor", header: _("lasttimeeditor"), adjust: true},
        {id: "autofilling", header: _("autofilling"), adjust: true},
        {id: "type", header: _("type"), adjust: true, hidden: true},
        {
          id: "changeWeight", header: "",
          adjust: true, hidden: hideOptions.save, template: function (obj) {
            var html = "<div class='change_element" + "'>";
            return html + "</div>";
          }
        },
        {
          id: "save", header: "",
          adjust: true, hidden: !access.adding_arch_data, template: function (obj) {
            var html = "<div class='save_element" + "'>";
            return html + "</div>";
          }
        }],
      on: {
        "onAfterEditStop": function (state, editor, ignoreUpdate) {
          var row = editor.row;
          try {
            var obj = $$('dynamic_operations').getItem(row);
          }
          catch (e) {
            console.log(e);
            return false;
          }
          //TARA CONTROL
          if (editor.column === "doc_cargo_weight") {
            //math:"[$r,brutto] - [$r,cargo_weight]",
            var _result = obj.brutto - obj.doc_cargo_weight;
            obj.start_weight = _result;
            $$('dynamic_operations').updateItem(obj.id, obj);
          }
          else if (editor.column === "wagon_number") {
            if ((obj.wagon_number + '').length === 0) {
              console.log((obj.wagon_number + '').length);
            }
            else if (obj.wagon_number > 2147483647 || obj.wagon_number < -2147483648) {
              webix.message({
                text: _("Incorrect wagon number"), type: "error", expire: 5000
              });
              obj.wagon_number = "";
              $$('dynamic_operations').updateItem(obj.id, obj);
            }
            else if ((obj.wagon_number + '').length !== 8) {
              webix.message({
                text: _("Incorrect wagon number"), type: "error", expire: 5000
              });
            }
            else {
              if (!parseWagonNumber(obj.wagon_number + '')) {
                //webix.message({
                //	text: _("Incorrect wagon number"),
                //	type: "error",
                //	expire: 5000
                //});
                //obj.wagon_number = "";
                $$('dynamic_operations').updateItem(obj.id, obj)
              }
              else {
                //HERE WE ARE LOOKING FOR MATCHING WAGON TYPES
                $$('dynamic_operations').eachRow(function (row) {
                  const record = $$('dynamic_operations').getItem(row);
                  if (record.wagon_number === obj.wagon_number) {
                    //потом нам надо чтобы у них были либо у одного brutto у другого cargo_weight либо наоборот
                    if (record.brutto !== "undefined" && record.brutto !== "" && record.brutto !== null && (record.cargo_weight === "undefined" || record.cargo_weight === "" || record.cargo_weight === null) && obj.cargo_weight !== "undefined" && obj.cargo_weight !== "" && obj.cargo_weight !== null && (obj.brutto === "undefined" || obj.brutto === "" || obj.brutto === null)) {
                      //собираем новый объект
                      var lastdateedited;
                      var lasttimeedited;
                      var lasttimeeditor;
                      var today = new Date();
                      var dd = today.getDate();
                      var mm = today.getMonth() + 1; //January is 0!
                      var yyyy = today.getFullYear();
                      if (dd < 10) dd = "0" + dd;
                      if (mm < 10) mm = "0" + mm;
                      var current_date = yyyy + "-" + mm + "-" + dd;
                      var hr = today.getHours();
                      if (hr < 10) hr = "0" + hr;
                      var min = today.getMinutes();
                      if (min < 10) min = "0" + min;
                      var sec = today.getSeconds();
                      if (sec < 10) sec = "0" + sec;
                      var current_time = hr + ":" + min + ":" + sec;
                      lastdateedited = current_date;
                      lasttimeedited = current_time;
                      lasttimeeditor = User;
                      var _obj = {};
                      _obj.id = obj.id;
                      _obj.direction = obj.direction;
                      _obj.write_date = obj.write_date;
                      _obj.write_time = obj.write_time;
                      _obj.wagon_number = obj.wagon_number;
                      _obj.start_weight = record.brutto - obj.cargo_weight;
                      _obj.doc_start_weight = obj.doc_start_weight;
                      _obj.brutto = record.brutto;
                      _obj.cargo_weight = obj.cargo_weight;
                      _obj.doc_cargo_weight = obj.doc_cargo_weight;
                      _obj.capacity = obj.capacity;
                      _obj.doc_number = obj.doc_number;
                      _obj.doc_date = obj.doc_date;
                      _obj.cargo_name = obj.cargo_name;
                      _obj.truck1_weight = obj.truck1_weight;
                      _obj.ft_axis_1 = obj.ft_axis_1;
                      _obj.ft_axis_2 = obj.ft_axis_2;
                      _obj.ft_axis_3 = obj.ft_axis_3;
                      _obj.ft_axis_4 = obj.ft_axis_4;
                      _obj.truck2_weight = obj.truck2_weight;
                      _obj.st_axis_1 = obj.st_axis_1;
                      _obj.st_axis_2 = obj.st_axis_2;
                      _obj.st_axis_3 = obj.st_axis_3;
                      _obj.st_axis_4 = obj.st_axis_4;
                      _obj.truck_diff = obj.truck_diff;
                      _obj.side_diff = obj.side_diff;
                      _obj.offset_lengthwise = obj.offset_lengthwise;
                      _obj.cross_offset = obj.cross_offset;
                      _obj.sender = obj.sender;
                      _obj.reciever = obj.reciever;
                      _obj.speed = obj.speed;
                      _obj.transporter = obj.transporter;
                      _obj.departure_point = obj.departure_point;
                      _obj.destination_point = obj.destination_point;
                      _obj.cargo = obj.cargo;
                      _obj.user = obj.user;
                      _obj.axels_count = obj.axels_count;
                      _obj.photo_path = obj.photo_path;
                      _obj.wagon_type = obj.wagon_type;
                      _obj.optional1 = obj.optional1;
                      _obj.optional2 = obj.optional2;
                      _obj.optional3 = obj.optional3;
                      _obj.optional4 = obj.optional4;
                      _obj.optional5 = obj.optional5;
                      _obj.autofilling = obj.autofilling;
                      _obj.lastdateedited = lastdateedited;
                      _obj.lasttimeedited = lasttimeedited;
                      _obj.lasttimeeditor = lasttimeeditor;
                      updateWeight(_obj, record.id)
                    }
                    else if (obj.brutto !== "undefined" && obj.brutto !== "" && obj.brutto !== null && (obj.cargo_weight === "undefined" || obj.cargo_weight === "" || obj.cargo_weight === null) && record.cargo_weight !== "undefined" && record.cargo_weight !== "" && record.cargo_weight !== null && (record.brutto === "undefined" || record.brutto === "" || record.brutto === null)) {
                      //собираем новый объект
                      var lastdateedited;
                      var lasttimeedited;
                      var lasttimeeditor;
                      var today = new Date();
                      var dd = today.getDate();
                      var mm = today.getMonth() + 1; //January is 0!
                      var yyyy = today.getFullYear();
                      if (dd < 10) dd = "0" + dd;
                      if (mm < 10) mm = "0" + mm;
                      var current_date = yyyy + "-" + mm + "-" + dd;
                      var hr = today.getHours();
                      if (hr < 10) hr = "0" + hr;
                      var min = today.getMinutes();
                      if (min < 10) min = "0" + min;
                      var sec = today.getSeconds();
                      if (sec < 10) sec = "0" + sec;
                      var current_time = hr + ":" + min + ":" + sec;
                      lastdateedited = current_date;
                      lasttimeedited = current_time;
                      lasttimeeditor = User;
                      var _obj = {};
                      _obj.id = obj.id;
                      _obj.direction = obj.direction;
                      _obj.write_date = obj.write_date;
                      _obj.write_time = obj.write_time;
                      _obj.wagon_number = obj.wagon_number;
                      _obj.doc_start_weight = obj.brutto - record.cargo_weight;
                      _obj.brutto = obj.brutto;
                      _obj.cargo_weight = record.cargo_weight;
                      _obj.doc_cargo_weight = obj.doc_cargo_weight;
                      _obj.capacity = obj.capacity;
                      _obj.doc_number = obj.doc_number;
                      _obj.doc_date = obj.doc_date;
                      _obj.cargo_name = obj.cargo_name;
                      _obj.truck1_weight = obj.truck1_weight;
                      _obj.ft_axis_1 = obj.ft_axis_1;
                      _obj.ft_axis_2 = obj.ft_axis_2;
                      _obj.ft_axis_3 = obj.ft_axis_3;
                      _obj.ft_axis_4 = obj.ft_axis_4;
                      _obj.truck2_weight = obj.truck2_weight;
                      _obj.st_axis_1 = obj.st_axis_1;
                      _obj.st_axis_2 = obj.st_axis_2;
                      _obj.st_axis_3 = obj.st_axis_3;
                      _obj.st_axis_4 = obj.st_axis_4;
                      _obj.truck_diff = obj.truck_diff;
                      _obj.side_diff = obj.side_diff;
                      _obj.offset_lengthwise = obj.offset_lengthwise;
                      _obj.cross_offset = obj.cross_offset;
                      _obj.sender = obj.sender;
                      _obj.reciever = obj.reciever;
                      _obj.speed = obj.speed;
                      _obj.transporter = obj.transporter;
                      _obj.departure_point = obj.departure_point;
                      _obj.destination_point = obj.destination_point;
                      _obj.cargo = obj.cargo;
                      _obj.user = obj.user;
                      _obj.axels_count = obj.axels_count;
                      _obj.photo_path = obj.photo_path;
                      _obj.wagon_type = obj.wagon_type;
                      _obj.optional1 = obj.optional1;
                      _obj.optional2 = obj.optional2;
                      _obj.optional3 = obj.optional3;
                      _obj.optional4 = obj.optional4;
                      _obj.optional5 = obj.optional5;
                      _obj.autofilling = obj.autofilling;
                      _obj.lastdateedited = lastdateedited;
                      _obj.lasttimeedited = lasttimeedited;
                      _obj.lasttimeeditor = lasttimeeditor;
                      updateWeight(_obj, record.id)
                    }
                  }
                });
                obj.wagon_type = setWagonType(obj.wagon_number + '');
                obj.axels_count = setAxelsCount(obj.wagon_number + '');
                $$('dynamic_operations').updateItem(obj.id, obj)
              }
            }
          }
          setWeight(obj);
        },
        "onItemClick": function (id, e, trg) {
          if (id.column === "save") {
            $$(datatable_name).editStop();
            var obj = ($$('dynamic_operations').getItem(id.row));
            if ((obj.cargo_weight || obj.doc_cargo_weight) && (obj.start_weight || obj.doc_start_weight) && obj.brutto) {
              if ((obj.capacity - obj.start_weight >= 0 && obj.start_weight !== null) || (obj.capacity - obj.doc_start_weight >= 0 && obj.doc_start_weight !== null)) {
                if (obj.wagon_number) {
                  setArchive(obj.id);
                  return false; // here it blocks the default behavior
                } else {
                  webix.message({
                    text: _("Wagon number is Invalid"),
                    type: "error",
                    expire: 5000
                  });
                }
              }
              else {
                webix.modalbox({
                  title: _("Start weight exceeds the start weight. Send this row to archive"),
                  buttons: [_("Yes"), _("No")],
                  width: 500,
                  text: "",
                  callback: function (result) {
                  	console.log(result);
                    if (result === '0' || result === true) {
                      setArchive(obj.id);
                      return false; // here it blocks the default behavior
                    }
                  }
                });
              }
            }
            else {
              webix.message({text: _("Form Data is Invalid"), type: "error", expire: 5000});
            }
          }
          else if (id.column === "changeWeight") {
            var obj = ($$('dynamic_operations').getItem(id.row));
            if (obj.cargo_weight > 0 || obj.brutto > 0) {
              var temp = obj.brutto;
              obj.brutto = obj.cargo_weight;
              obj.cargo_weight = temp;
              setWeight(obj);
              return false;
            }
          }
          else if (id.column === "del") {
            webix.modalbox({
              title: _("Really delete this row?"),
              buttons: [_("Yes"), _("No")],
              width: 500,
              text: "",
              callback: function (result) {
                if (result === true) result = '0';
                if (result === '0') {
                  var obj = ($$(datatable_name).getItem(id.row));
                  delWeight(obj.id);
                }
              }
            });
            return false;
          }
          else if (id.column === "direction") {
            var obj = ($$(datatable_name).getItem(id.row));
            obj.direction = !obj.direction;
            setWeight(obj);
          }
        },
        "onBeforeDrag": function (context, ev) {
          var sourceInfo = $$(datatable_name).locate(ev);
          console.log(sourceInfo);
          context.value = context.from.getItem(sourceInfo.row)[sourceInfo.column];
          context.html = "<div style='padding:8px;'>" + context.value + "<br></div>";
        },
        "onBeforeDrop": function (context, ev) {
          var targetInfo = this.locate(ev);
          var col = targetInfo.column;
          var item = this.getItem(targetInfo.row);
          item[col] = context.value;
          this.updateItem(targetInfo.row, item);
          return false
        }
      },
      math: true,
      rightSplit: rightColsToShowIfAccess,
      leftSplit: countLeftCols
    };
  }

  ready (grid) {
    const list_length = this.app.config.listLength;
    const ip = this.app.config.remoteHOST;
    const User = this.app.config.user;
    const datatable_name = "dynamic_operations";

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

    function getOperationTable () {
      var _methodName = "getOperationTable";
      webix.ajax().post(
        ip, {"method": "getOperationTable", "user": User, "params": {"type": "dynamic"}},
        function (text, xml, xhr) {
          var data = JSON.parse(text);
          console.log(data);
          if (data.method === _methodName) {
            if (data.answer === "ok") {
              $$(datatable_name).clearAll();
              $$(datatable_name).parse(data.params);
              $$(datatable_name).sort("#id#", "asc", "int");
            }
          }
        });
    }

    getOperationTable();
  }
}
