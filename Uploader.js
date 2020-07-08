
import * as _Config from "./Config.js";
import * as _LOADING from "./loading.js";
import { sweetAlert } from "./Alert.js";
import * as _MD5 from "./MD5.js";

    export const trigger = () => {
        $('#multiFileBtn').click();
    }

    export const add = ( _finput ) => {
        const _webForm = $('#webForm');
        _webForm.attr('data-Process', _finput.files.length);

        /* Init Row */
        _webForm.find(`#addfile`).html("");
        
        _LOADING.start();
        Object.values(_finput.files).forEach((_el, _idx) => {
            (
                (fbrop, num) => {
                    // MD5, ext 계산시작
                    fileCheck(fbrop, num);
                }
            )( _el, _idx );
        });
    }

    export const fileCheck = ( _fbrop, _idx ) => {
        const _webForm = $('#webForm');
        const _webUpload = _webForm.find('#webUpload');
        const _Tbody = _webUpload.find(`#addfile`);
        _MD5.getMD5(
            _fbrop, ( prog ) => {
                /* CallBack */
                console.log("Progress: " + prog);
            }
        ).then(
            res => {
                /* Create & Append Dom */
                _Tbody.append( 
                    getRow( _fbrop.name, _idx ) 
                );
                /* Set Extension  */
                _webUpload.find(`#file_type_${_idx}`).val( 
                    getExtension(_fbrop)
                );
                /* Insert MD5 */
                _webUpload.find(`#md5_${_idx}`).val(res);
                /* Remaning Check */
                const _Remaining =  Number( _webForm.attr('data-Process') ) - 1 ; 
                _webForm.attr( 'data-Process', _Remaining );
                if(_webForm.attr('data-Process') == "0") {
                    _LOADING.end();
                }
            },
            err => console.error(err)
        );
    }

    // 파일 업로드 동작실행 ( 로딩바 및 업로드 경과율 계산 )
    export const upload = () => {
        const _webForm = $('#webForm');
        const _webUpload = _webForm.find('#webUpload');
        const _fileCount = _webForm.find(`#addfile`).find(`tr`).length;

        if ( _fileCount == 0 ) {
            sweetAlert(`업로드할 파일이 없습니다.`);
            return false;
        }

        if( _webForm.attr('data-Process') != "0" ){
            heartalert2('파일 업로드 불가!', "선택파일의 MD5정보를 계산하는 중입니다.", 'error');
            return false;
        };

        if( beforeSubmit() ) {
            submit( (new FormData( _webForm.get(0) )) );
        }
    }



    function submit(_FileData) {

        _FileData.set("ID", $("#wr_id").val());
        for(const pair of _FileData.entries()) {
            console.log(`${pair[0]} ----- `);
            console.log(pair[1]);
        }

        const _RunModule = $(`#RunModule`);
        _RunModule.append( 
            $(`<div id="js-run-loading"></div>`) 
        );

        const _ldBar = new ldBar("#js-run-loading");
        
        $.ajax({
            url: `${_Config['View']['URL']}/ajax-web-Upload`,
            type:  "POST",
            dataType:  "html",
            data: _FileData,
            //async:  false,
            cache:  false,
            processData:  false,
            contentType:  false,
            beforeSend : function(xhr, opts) {
                // uploadingCtl("block");
            },
            xhr: () => {
                const _xhr = new window.XMLHttpRequest();
                _xhr.upload.addEventListener("progress", function (e) {
                    if (e.lengthComputable) {
                        const _Completed = parseInt( e.loaded / e.total * 100 );
                        console.log(`%c CURRENT: ${e.loaded} %c TOTAL: ${e.total} %c REST: ${(e.total - e.loaded)}`, "color:green", "color:orange", "color:red");
                        if( ( _Completed % 10 ) == 0 ) {
                            console.log(`PROGRESS --------------------------------------> ${_Completed}%`);
                        }
                        _ldBar.set( _Completed );
                    }
                }, false);
                return _xhr;
            }
        }).done((data) => {
            console.log(data);
            if(data!="") {
                $("#webDatas").attr("isNull","N");
                $("#webDatas").html(data);
                heartalert2('파일등록 성공!', "RUN파일 등록이 완료되었습니다.", 'success');
                $(`#${_Config['View']['ID']}`).dialog("destroy");
            } else {
                heartalert2('파일등록 실패!', "새로운 RUN파일을 추가 후 등록하시기 바랍니다.", 'error');
            }
        }).fail((jqXHR, textStatus, errorTrown) => {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorTrown);
        })
    }

    function beforeSubmit() {
        const _webForm = $('#webForm');
        let chklist = true;
        if(chklist) {
            _webForm.find( ".required" ).each(function( _index ) {
                if(chklist) {
                    if($(this).val() == "") {
                        console.log();
                        alert(" 필수 입력사항을 확인해주세요.");
                        console.log($(this));
                        console.log("ul.tab li"+"#"+$(this).parents("div .tab_content").attr("id")+"_in");
                        $("ul.tab li"+"#"+$(this).parents("div .tab_content").attr("id")+"_in").click();
                        $(this).focus();
                        chklist = false;
                    }
                }
            });

            $( "#webForm .need2chk" ).each(function( index ) {
            if(chklist) {
                if($(this).val() == "") {
                    $("ul.tab li"+"#"+$(this).parents("div .tab_content").attr("id")+"_in").click();
                    $(this).focus();
                    chklist = false;
                } else if ($(this).val().includes('.zip')) {
                    $(this).focus();
                    alert("Zip 파일은 업로드 하실 수 없습니다.");
                    chklist = false;
                }
            }
            });

        }
        return chklist;
    }


    export const getRow = (_fname, _idx) => {
        return `<tr id='file_form_${ _idx }' name='file_form[]'>"
            <td>${ _idx + 1 }</td>
            <td>
                <select name='file_type[]' id='file_type_${ _idx }' value='' class='frm_input'>
                </select>
            </td>
            <td>
                <input type='text' name='file_name[]' id='file_name_${ _idx }' value='${ _fname }' class=' frm_input need2chk' size='80' style='width:100%' readonly>
            </td>
            <td>
                <input type='text' name='md5[]' id='md5_${ _idx }' value='' class='frm_input' readonly >
            </td>
            <td>
                <select name='reference_for[]' id='reference_for_${ _idx }' value='' class='required frm_input' style='width:90px'>
                    <option value='data' selected=''>Data files</option>
                </select>
            </td>
        </tr>`;
    }

    export const getExtension = (fbrop) => {
        let ext;
        const _Fname = fbrop.name;
        const _Sliced = _Fname.split(".").slice(-2);

        if ( _Sliced[1] != "gz"){
            ext = _Sliced[1];
        } else {
            ext = _Sliced[0];
        }

        switch (ext) {
            case 'txt':
                // 그대로 적용
                return ext;
            default:
                // 규격이 아닌파일
                return 'other';
        }
    }