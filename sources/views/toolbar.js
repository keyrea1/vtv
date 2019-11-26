import {JetView} from "webix-jet";

export default class ToolView extends JetView {
  config () {
    const _ = this.app.getService("locale")._;
    const theme = this.app.config.theme;
    const ids = this.app.config.ids;
    const globals = this.app.config.globals;
    const ip = this.app.config.remoteHOST;
    const User = this.app.config.user;
    var referenceView = this;

    var showApproveBtn = false;
    if (User === 3 || User === "3" || User === 4 || User === "4") showApproveBtn = true;

    var dt1 = "dt1" + ids.dt1;
    ids.dt1 = ids.dt1 + 1;
    var win1 = "win1" + ids.win1;
    var win2 = "adcWindowPopupID" + ids.win1;
    var win3 = "cameraWindow" + ids.win1;
    var adcdataname1 = "adcdataname1" + ids.win1;
    var adcdataname2 = "adcdataname2" + ids.win1;
    var cameradataname1 = "caneradataname2" + ids.win1;
    var _popup2 = "_popup2" + ids.win1;
    ids.win1 = ids.win1 + 1;
    var close = "close" + ids.close;
    ids.close = ids.close + 1;
    newv => this.app.config.ids = ids;

    var _organizationName = Math.random() * 99999999 + "_organizationName";
    var _typeOfScales = Math.random() * 99999999 + "_typeOfScales";
    var _siNumber = Math.random() * 99999999 + "_siNumber";
    var _accuracyType = Math.random() * 99999999 + "_accuracyType";
    var _serialNumber = Math.random() * 99999999 + "_serialNumber";
    var id_activ_key = Math.random() * 99999999 + "_activate_key";
    var id_serial = Math.random() * 99999999 + "_id_serial";
    var id_weight_number = Math.random() * 99999999 + "_id_weight_number";

    function getAcivatiionCode () {
      var _methodName = "getProcessor";
      webix.ajax().post(
        ip,
        {"method": _methodName, "user": 3, "params": []},
        function (text, xml, xhr) {
          var data = JSON.parse(text);
          console.log(data);
          if (data.method === _methodName) {
            if (data.answer === "ok") {
              $$(id_activ_key).setValue(data.params);
            }
          }
        }
      )
    }

    function setSerial (serial, number) {
      var _methodName = "setSerial";
      webix.ajax().post(
        ip,
        {"method": _methodName, "user": 3, "params": {"serial": serial, "number": number}},
        function (text, xml, xhr) {
          var data = JSON.parse(text);
          console.log(data);
          if (data.method === _methodName) {
            if (data.answer === "ok") {
              $$("login_form").show();
              serialWindow.hide();
              webix.message({type: "success", text: _(data.params.message)});
            }
            else if (data.answer === "error") {
              webix.message({type: "error", text: _(data.params.message)});
            }
          }
        }
      )
    }

    function setOrganizationName (organization_name) {
      var methodName = "setOrganizationName";
      webix.ajax().post(
        ip,
        {
          "method": methodName,
          "user": User,
          "params": {
            "organizationName": organization_name
          }
        },
        function (text, xml, xhr) {
          var data = JSON.parse(text);
          if (data.method === methodName) {
            if (data.answer === "ok") {
              webix.message({type: "default", text: _(data.params.message)});
            }
            else webix.message({
              type: "error", text: _(data.params.message)
            });
          }
          else webix.message({
            type: "error", text: _(data.params.message)
          });
        }
      );
    }

    function setHardwareInfo (weight_type, nomerSI, accuracy, weight_number) {
      var methodName = "setHardwareInfo";
      webix.ajax().post(
        ip,
        {
          "method": methodName,
          "user": User,
          "params": {
            "weight_type": weight_type,
            "nomersi": nomerSI,
            "accuracy": accuracy,
            "weight_number": weight_number,
          }
        },
        function (text, xml, xhr) {
          var data = JSON.parse(text);
          if (data.method === methodName) {
            if (data.answer === "ok") {
              webix.message({type: "default", text: _(data.params.message)});
            }
            else webix.message({
              type: "error", text: _(data.params.message)
            });
          }
          else webix.message({
            type: "error", text: _(data.params.message)
          });
        }
      );
    }

    var _0;
    var _1;
    var _2;
    var _3;
    var _4;
    if (User === 3 || User === 4) {
      _0 = {
        view: "text",
        minWidth: 350,
        height: 30,
        id: _organizationName,
        value: globals.organizationName
      };
      _1 = {
        view: "text",
        minWidth: 350,
        height: 30,
        id: _typeOfScales,
        value: globals.hardware.typeOfScales
      };
      _2 = {
        view: "text",
        minWidth: 60,
        height: 30,
        id: _siNumber,
        value: globals.hardware.siNumber
      };
      _3 = {
        view: "text",
        minWidth: 60,
        height: 30,
        id: _accuracyType,
        value: globals.hardware.accuracyType
      };
      _4 = {
        view: "text",
        minWidth: 60,
        height: 30,
        id: _serialNumber,
        value: globals.hardware.serialNumber
      };
    }
    else {
      _0 = {
        view: "text",
        minWidth: 350,
        height: 30,
        id: _organizationName,
        value: globals.organizationName,
        readonly: true
      };
      _1 = {
        view: "text",
        minWidth: 350,
        height: 30,
        id: _typeOfScales,
        value: globals.hardware.typeOfScales,
        readonly: true
      };
      _2 = {
        view: "text",
        minWidth: 60,
        height: 30,
        id: _siNumber,
        value: globals.hardware.siNumber,
        readonly: true
      };
      _3 = {
        view: "text",
        minWidth: 60,
        height: 30,
        id: _accuracyType,
        value: globals.hardware.accuracyType,
        readonly: true
      };
      _4 = {
        view: "text",
        minWidth: 60,
        height: 30,
        id: _serialNumber,
        value: globals.hardware.serialNumber,
        readonly: true
      };
    }

    var adcDataWindow = webix.ui({
      view: "window",
      css: theme,
      id: win2,
      height: 230,
      width: 330,
      head: {
        view: "toolbar", margin: -4, cols: [
          {view: "label", label: _("ADC Data"), width: 290},
          {
            view: "label",
            template: function (obj) {
              var html = "<div class='del_element'>";
              return html + "</div>";
            },
            click: function () {
              $$(win2).hide();
              referenceView.app.callEvent('exchangeADCstop');
            }
          }
        ]
      },
      body: {
        rows: [
          {
            view: "toolbar", margin: -4, cols: [
              {},
              {
                view: "datatable",
                id: adcdataname1,
                editable: false,
                scroll: false,
                height: 220,
                width: 165,
                select: "row",
                navigation: true,
                hover: "myhover",
                columns: [
                  {
                    id: "id", header: "", width: 30,
                  },
                  {
                    id: "raw", header: _("raw"), width: 70,
                    editor: "text"
                  },
                  {
                    id: "offset", header: _("offset"), width: 60,
                    editor: "text"
                  }
                ],
                on: {
                  "onItemClick": function (id, e, trg) {
                    if (id.column === "inv") {
                      $$("adcData1").editStop();
                      var obj = ($$("adcData1").getItem(id.row));
                      if (obj.inversion === true) obj.inversion = false;
                      else obj.inversion = true;
                      $$("adcData1").updateItem(id, obj);
                    }
                  }
                }
              },
              {
                view: "datatable",
                id: adcdataname2,
                editable: false,
                scroll: false,
                height: 220,
                width: 165,
                select: "row",
                navigation: true,
                hover: "myhover",
                columns: [
                  {
                    id: "id", header: "", width: 30,
                    adjust: true
                  },
                  {
                    id: "raw", header: _("raw"), width: 70,
                    editor: "text"
                  },
                  {
                    id: "offset", header: _("offset"), width: 60,
                    editor: "text",
                  }
                ],
                on: {
                  "onItemClick": function (id, e, trg) {
                    if (id.column === "inv") {
                      $$("adcData2").editStop();
                      var obj = ($$("adcData2").getItem(id.row));
                      if (obj.inversion === true) obj.inversion = false;
                      else obj.inversion = true;
                      $$("adcData2").updateItem(id, obj);
                    }
                  }
                }
              },
              {}
            ]
          }]
      }
    });

    var cameraWindow = webix.ui({
      view: "window",
      css: theme,
      id: win3,
      height: 237,
      width: 260,
      head: {
        view: "toolbar", margin: -4, cols: [
          {view: "label", label: _("Camera Data"), width: 220},
          {
            view: "label",
            template: function (obj) {
              var html = "<div class='del_element'>";
              return html + "</div>";
            },
            click: function () {
              $$(win3).hide();
              referenceView.app.callEvent('exchangeCAMERASstop');
            }
          }
        ]
      },
      body: {
        rows: [
          {
            view: "toolbar", margin: -4, cols: [
              {
                view: "datatable",
                id: cameradataname1,
                editable: false,
                scroll: "y",
                height: 192,
                width: 260,
                select: "row",
                navigation: true,
                hover: "myhover",
                columns: [
                  {
                    id: "id", header: "", width: 30,
                  },
                  {
                    id: "camera", header: _("camera"), width: 70,
                    editor: "text", fillspace: true
                  },
                  {
                    id: "status", header: _("status"), width: 75,
                    template: data => {
                      if (data.status === true) {
                        return `<span class='webix_icon wxi wxi-success ${data.status}'></span>`;
                      }
                      else
                        return `<span class='webix_icon wxi wxi-no-item ${data.status}'></span>`;
                    }
                  }
                ],
              },
            ]
          }]
      }
    });

    var serialWindow = webix.ui({
      view: "window",
      css: theme,
      width: 800,
      move: false,
      head: {
        view: "toolbar", margin: -4, cols: [
          {view: "label", label: _("Re-Activation menu"), minWidth: 760},
          {
            view: "label",
            template: function (obj) {
              return "<div class='del_element'></div>";
            },
            click: function () {
              serialWindow.hide();
            }
          },
        ]
      },
      body: {
        rows: [
          {},
          {
            cols: [
              {},
              {css: 'logo', width: 550, height: 140},
              {}
            ]
          },
          {},
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message - Re-activation'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message2'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message3'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message4'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message5'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message6'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message7'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message8'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message9'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message10 - Re-activation'), width: 550},
              {}
            ]
          },
          {height: 30},
          {
            cols: [
              {},
              {view: 'label', label: _('Activation key'), width: 130},
              {
                view: 'text', width: 400, id: id_activ_key, readonly: true
              },
              {}
            ]
          },
          {
            cols: [
              {},
              {view: "label", label: _("Weight number"), width: 130},
              {
                view: "text", width: 400, id: id_weight_number,
                on: {
                  "onEnter": function (state, editor, ignoreUpdate) {
                    $$("weight_number").$view.querySelector("input").focus();
                  }
                }
              },
              {}
            ]
          },
          {
            cols: [
              {},
              {view: "label", label: _("Serial key"), width: 130},
              {
                view: "text", width: 400, id: id_serial,
                on: {
                  "onEnter": function (state, editor, ignoreUpdate) {
                    var _serial = $$(id_serial).getValue();
                    var _number = $$(id_weight_number).getValue();
                    setSerial(_serial, _number);
                  }
                }
              },
              {}
            ]
          },
          {height: 10},
          {
            cols: [
              {},
              {
                view: "button", width: 150, value: _("Approve"),
                click: function () {
                  var _serial = $$(id_serial).getValue();
                  var _number = $$(id_weight_number).getValue();
                  setSerial(_serial, _number);
                }
              },
              {}
            ]
          }, {height: 10}]
      }
    });

    const popUp2 = {
      view: "window",
      id: _popup2,
      css: theme,
      width: 600,
      move: true,
      head: {
        view: "toolbar", margin: -4, cols: [
          {view: "label", label: _("About"), minWidth: 560},
          {
            view: "label",
            template: function (obj) {
              return "<div class='del_element'></div>";
            },
            click: function () {
              $$(_popup2).hide();
            }
          },
        ]
      },
      body: {
        rows: [
          {
            multi: true,
            view: "accordion",
            css: "webix_dark",
            height: 600,
            width: 700,
            cols: [
              {
                collapsed: true, header: _("Help"),
                body: _("VTV program is designed for accurate, manual and automatic weighing of trains. There is also the possibility of dosing.\n" +
                  "For more information, contact technical support by phone: +7 1234 56789. \nС “ООО “ВТВ”, 2019"),
                width: 600
              },
              {
                collapsed: false,
                header: _("About"),
                body: {
                  cols: [
                    {width: 10},
                    {
                      rows: [
                        {
                          cols: [
                            {label: _("Organization"), view: "label", width: 200},
                            _0
                          ]
                        },
                        {label: _("Hardware"), view: "label", position: "center", minWidth: 20},
                        {
                          cols: [
                            {label: _("Type of scales"), view: "label", width: 200},
                            _1
                          ]
                        },
                        {
                          cols: [
                            {label: _("siNumber"), view: "label", width: 200},
                            _2
                          ]
                        },
                        {
                          cols: [
                            {label: _("accuracyType"), view: "label", width: 200},
                            _3
                          ]
                        },
                        {
                          cols: [
                            {label: _("serialNumber"), view: "label", width: 200},
                            _4
                          ]
                        },
                        {height: 10},
                        {label: _("Software"), view: "label", width: 200},
                        {
                          cols: [
                            {label: _("name"), view: "label", width: 200},
                            {
                              view: "text",
                              minWidth: 60,
                              height: 30,
                              value: globals.software.name,
                              readonly: true
                            },
                          ]
                        },
                        {
                          cols: [
                            {label: _("ID"), view: "label", width: 200},
                            {
                              view: "text",
                              minWidth: 60,
                              height: 30,
                              value: globals.software.ID,
                              readonly: true
                            },
                          ]
                        },
                        {
                          cols: [
                            {label: _("version"), view: "label", width: 200},
                            {
                              view: "text",
                              minWidth: 60,
                              height: 30,
                              value: globals.software.version,
                              readonly: true
                            },
                          ]
                        },
                        {
                          cols: [
                            {label: _("md5"), view: "label", width: 200},
                            {
                              view: "text",
                              minWidth: 60,
                              height: 30,
                              value: globals.software.md5,
                              readonly: true
                            },
                          ]
                        },
                        {
                          cols: [
                            {label: _("Release"), view: "label", width: 200},
                            {
                              view: "text",
                              minWidth: 60,
                              height: 30,
                              value: globals.software.release,
                              readonly: true
                            },
                          ]
                        },
                        {},
                        {
                          view: "button", value: _("Enter serial key"), click: function () {
                            let width = $$("top1").getTopParentView()["$width"] / 2 - 400;
                            let heigth = $$("top1").getTopParentView()["$height"] / 2 - 400;
                            serialWindow.setPosition(width, heigth);
                            serialWindow.show();
                            getAcivatiionCode();
                          }
                        },
                        {height: 10}
                      ]
                    }]
                },
                width: 600
              }
            ]
          },
          {
            view: "toolbar", margin: -4, cols: [
              {
                view: "button", value: _("Close"), click: function () {
                  $$(_popup2).hide();
                }
              },
              {width: 10, hidden: !showApproveBtn},
              {
                hidden: !showApproveBtn, view: "button", value: _("Save"), click: function () {
                  var weight_type = $$(_typeOfScales).getValue();
                  var nomerSI = $$(_siNumber).getValue();
                  var accuracy = $$(_accuracyType).getValue();
                  var weight_number = $$(_serialNumber).getValue();
                  var organization_name = $$(_organizationName).getValue();
                  setOrganizationName(organization_name);
                  setHardwareInfo(weight_type, nomerSI, accuracy, weight_number);
                }
              }
            ]
          }]
      }
    };

    return {
      view: "toolbar", css: theme,
      height: 56,
      elements: [
        {
          view: "icon", icon: "wxi wxi-menu",
          click: () => this.app.callEvent("menu:toggle")
        },
        {css: "logo", width: 230},
        {width: 5},
        {
          id: "top1",
          view: "label",
          label: _("Connecting to server"),
          css: {"font-size": "25pt !important"},
          width: 635
        },
        {
          paddingY: 7,
          rows: [
            {
              margin: 8,
              cols: [
                {
                  view: "icon", icon: "wxi wxi-help",
                  tooltip: _("Help"), popup: popUp2,
                  click: function () {
                    $$("helpButtonID").setValue(_popup2);
                  }
                }
              ]
            }
          ]
        },
        {
          view: "button", width: 60, value: _("ADC"), click: function () {
            if (adcDataWindow.isVisible()) {
              referenceView.app.callEvent("exchangeADCstop");
              adcDataWindow.hide();
            }
            else {
              var _ids = referenceView.app.config.ids;
              _ids.adcWdwID = win2;
              newv => this.app.config.ids = ids;
              $$("adcWindowID").setValue(win2);
              adcDataWindow.setPosition(966, 56);
              adcDataWindow.show();
              referenceView.app.callEvent("exchangeADC");
            }
          }
        },
        {
          view: "layout", id: "statusADC", width: 100, rows: [
            {
              height: 27, cols: [
                {id: "_adc1", view: "label", label: "1", css: {"font-size": "10pt !important"}},
                {id: "_adc2", view: "label", label: "2", css: {"font-size": "10pt !important"}},
                {id: "_adc5", view: "label", label: "5", css: {"font-size": "10pt !important"}},
                {id: "_adc6", view: "label", label: "6", css: {"font-size": "10pt !important"}},
              ]
            },
            {
              height: 25, cols: [
                {id: "_adc3", view: "label", label: "3", css: {"font-size": "10pt !important"}},
                {id: "_adc4", view: "label", label: "4", css: {"font-size": "10pt !important"}},
                {id: "_adc7", view: "label", label: "7", css: {"font-size": "10pt !important"}},
                {id: "_adc8", view: "label", label: "8", css: {"font-size": "10pt !important"}}
              ]
            },
          ]
        },
        {width: 2},
        {
          hidden: !globals._package.recognition,
          icon: "wxi wxi-camera", view: "icon",
          width: 40, click: function () {
            if (cameraWindow.isVisible()) {
              referenceView.app.callEvent('exchangeCAMERASstop');
              cameraWindow.hide();
            }
            else {
              var _ids = referenceView.app.config.ids;
              _ids.cameraWdwID = win3;
              newv => this.app.config.ids = ids;
              cameraWindow.setPosition(966, 56);
              cameraWindow.show();
              referenceView.app.callEvent('exchangeCAMERAS');
            }
          }
        },
        {width: 30},
        {width: 6},
        //TODO: refactor this
        {view: "text", minWidth: 60, height: 30, id: "staticTruckLastID", hidden: true},
        {view: "text", minWidth: 60, height: 30, id: "staticTruckLastID2", hidden: true},
        {view: "text", minWidth: 60, height: 30, id: "blocking", hidden: true, value: '0'},
        {view: "text", minWidth: 60, height: 30, id: "x", hidden: true, value: 0},
        {view: "text", minWidth: 60, height: 30, id: "y", hidden: true, value: 0},
        {view: "text", minWidth: 60, height: 30, id: "nameForADCdata1", hidden: true, value: adcdataname1},
        {view: "text", minWidth: 60, height: 30, id: "nameForADCdata2", hidden: true, value: adcdataname2},
        {view: "text", minWidth: 60, height: 30, id: "nameForCAMERASdata", hidden: true, value: cameradataname1},
        {view: "text", minWidth: 60, height: 30, id: "lockWindow", hidden: true, value: ""},
        {view: "text", minWidth: 60, height: 30, id: "lockWindowBlockingLabel", hidden: true, value: ""},
        {view: "text", minWidth: 60, height: 30, id: "warningWindow", hidden: true, value: ""},
        {view: "text", minWidth: 60, height: 30, id: "passForCalibration", hidden: true, value: ""},
        {view: "text", minWidth: 60, height: 30, id: "helpButtonID", hidden: true, value: ""},
        {view: "text", minWidth: 60, height: 30, id: "adcWindowID", hidden: true, value: ""},
        {view: "text", minWidth: 60, height: 30, id: "win1", hidden: true, value: "tableconfstat"},
        {view: "text", minWidth: 60, height: 30, id: "win11", hidden: true, value: "tableconfdyn"},
      ]
    };
  }
}
