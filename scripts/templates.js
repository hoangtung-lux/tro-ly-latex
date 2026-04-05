/**
 * Template System Module
 * Provides professional presets for exam and worksheet layouts
 */

(function() {
    const Templates = {
        data: {
            'thpt-quoc-gia': {
                orgTop: "SỞ GIÁO DỤC VÀ ĐÀO TẠO",
                orgName: "THPT QUỐC GIA - KHẢO SÁT",
                examName: "KỲ THI TRUNG HỌC PHỔ THÔNG QUỐC GIA",
                subject: "Môn: TOÁN HỌC",
                duration: "90 phút",
                docId: "101",
                ansSheet: true,
                fullPreamble: true
            },
            'kiem-tra-1-tiet': {
                orgTop: "TRƯỜNG THPT X",
                orgName: "TỔ TOÁN - TIN",
                examName: "KIỂM TRA ĐỊNH KỲ LẦN 1",
                subject: "Môn: ĐẠI SỐ 12",
                duration: "45 phút",
                docId: "01",
                ansSheet: false,
                fullPreamble: true
            },
            'phieu-hoc-tap': {
                orgTop: "PHIẾU HỌC TẬP SỐ 01",
                orgName: "Chương 1: Khối Đa Diện",
                examName: "HỌC SINH TỰ HỌC",
                subject: "Lớp: 12A1",
                duration: "20 phút",
                docId: "00",
                ansSheet: false,
                fullPreamble: false
            }
        },

        apply(templateId) {
            const t = this.data[templateId];
            if (!t) return;

            // Update UI elements
            const mapping = {
                'doc-org-top': t.orgTop,
                'doc-org-name': t.orgName,
                'doc-exam-name': t.orgTop, // Fallback exam name to top if same
                'doc-exam-name': t.examName,
                'doc-subject': t.subject,
                'doc-duration': t.duration, // Placeholder check
                'doc-id': t.docId,
                'doc-ans-sheet': t.ansSheet,
                'doc-full-preamble': t.fullPreamble
            };

            for (const [id, val] of Object.entries(mapping)) {
                const el = document.getElementById(id);
                if (!el) continue;

                if (el.type === 'checkbox') {
                    el.checked = val;
                } else {
                    el.value = val;
                }
                
                // Trigger input event for live preview
                el.dispatchEvent(new Event('input'));
            }

            if (window.showToast) window.showToast(`Đã áp dụng mẫu: ${t.examName}`);
        }
    };

    window.insertTemplate = (id) => Templates.apply(id);
})();
