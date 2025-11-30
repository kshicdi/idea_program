#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
안드로이드 파일 전송 프로그램
ADB 또는 WiFi/FTP를 사용하여 안드로이드 기기에 파일을 전송합니다.
"""

import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import subprocess
import threading
import os
import sys
from ftplib import FTP
import socket


class AndroidFileTransfer:
    def __init__(self, root):
        self.root = root
        self.root.title("안드로이드 파일 전송")
        self.root.geometry("650x700")
        self.root.resizable(False, False)
        
        # 변수 초기화
        self.selected_files = []
        self.device_connected = False
        self.transfer_mode = tk.StringVar(value="wifi")  # "usb" or "wifi"
        
        self.setup_ui()
        if self.transfer_mode.get() == "usb":
            self.check_adb_available()
            self.check_device_connection()
    
    def setup_ui(self):
        """UI 구성"""
        # 제목
        title_label = tk.Label(
            self.root, 
            text="안드로이드 파일 전송", 
            font=("맑은 고딕", 18, "bold")
        )
        title_label.pack(pady=15)
        
        # 전송 방식 선택 프레임
        mode_frame = tk.LabelFrame(
            self.root,
            text="전송 방식 선택",
            font=("맑은 고딕", 10, "bold"),
            padx=10,
            pady=10
        )
        mode_frame.pack(pady=10, padx=20, fill=tk.X)
        
        usb_radio = tk.Radiobutton(
            mode_frame,
            text="USB/ADB (USB 디버깅 필요)",
            variable=self.transfer_mode,
            value="usb",
            command=self.on_mode_change,
            font=("맑은 고딕", 10)
        )
        usb_radio.pack(anchor=tk.W, pady=2)
        
        wifi_radio = tk.Radiobutton(
            mode_frame,
            text="WiFi/FTP (USB 디버깅 불필요)",
            variable=self.transfer_mode,
            value="wifi",
            command=self.on_mode_change,
            font=("맑은 고딕", 10)
        )
        wifi_radio.pack(anchor=tk.W, pady=2)
        
        # 기기 연결 상태 프레임
        status_frame = tk.Frame(self.root)
        status_frame.pack(pady=10)
        
        self.status_label = tk.Label(
            status_frame,
            text="전송 방식을 선택하세요",
            font=("맑은 고딕", 11)
        )
        self.status_label.pack()
        
        self.refresh_btn = tk.Button(
            status_frame,
            text="연결 확인",
            command=self.check_connection,
            font=("맑은 고딕", 10)
        )
        self.refresh_btn.pack(pady=5)
        
        # WiFi/FTP 설정 프레임
        self.wifi_frame = tk.LabelFrame(
            self.root,
            text="FTP 서버 정보",
            font=("맑은 고딕", 10, "bold"),
            padx=10,
            pady=10
        )
        self.wifi_frame.pack(pady=10, padx=20, fill=tk.X)
        
        # IP 주소
        ip_label = tk.Label(
            self.wifi_frame,
            text="IP 주소:",
            font=("맑은 고딕", 9)
        )
        ip_label.grid(row=0, column=0, sticky=tk.W, pady=3)
        
        self.ip_entry = tk.Entry(
            self.wifi_frame,
            font=("맑은 고딕", 9),
            width=20
        )
        self.ip_entry.insert(0, "192.168.")
        self.ip_entry.grid(row=0, column=1, sticky=tk.W, padx=5, pady=3)
        
        # 포트
        port_label = tk.Label(
            self.wifi_frame,
            text="포트:",
            font=("맑은 고딕", 9)
        )
        port_label.grid(row=1, column=0, sticky=tk.W, pady=3)
        
        self.port_entry = tk.Entry(
            self.wifi_frame,
            font=("맑은 고딕", 9),
            width=20
        )
        self.port_entry.insert(0, "2121")
        self.port_entry.grid(row=1, column=1, sticky=tk.W, padx=5, pady=3)
        
        # 사용자명
        user_label = tk.Label(
            self.wifi_frame,
            text="사용자명:",
            font=("맑은 고딕", 9)
        )
        user_label.grid(row=2, column=0, sticky=tk.W, pady=3)
        
        self.user_entry = tk.Entry(
            self.wifi_frame,
            font=("맑은 고딕", 9),
            width=20
        )
        self.user_entry.insert(0, "android")
        self.user_entry.grid(row=2, column=1, sticky=tk.W, padx=5, pady=3)
        
        # 비밀번호
        pass_label = tk.Label(
            self.wifi_frame,
            text="비밀번호:",
            font=("맑은 고딕", 9)
        )
        pass_label.grid(row=3, column=0, sticky=tk.W, pady=3)
        
        self.pass_entry = tk.Entry(
            self.wifi_frame,
            font=("맑은 고딕", 9),
            width=20,
            show="*"
        )
        self.pass_entry.insert(0, "android")
        self.pass_entry.grid(row=3, column=1, sticky=tk.W, padx=5, pady=3)
        
        # 안내 메시지
        info_label = tk.Label(
            self.wifi_frame,
            text="안드로이드에서 FTP 서버 앱을 실행하세요\n(예: FTP Server, WiFi FTP Server 등)",
            font=("맑은 고딕", 8),
            fg="gray",
            justify=tk.LEFT
        )
        info_label.grid(row=4, column=0, columnspan=2, sticky=tk.W, pady=5)
        
        # 파일 선택 프레임
        file_frame = tk.Frame(self.root)
        file_frame.pack(pady=20, padx=20, fill=tk.BOTH, expand=True)
        
        file_select_btn = tk.Button(
            file_frame,
            text="파일 선택",
            command=self.select_files,
            font=("맑은 고딕", 12),
            bg="#4CAF50",
            fg="white",
            width=15,
            height=2
        )
        file_select_btn.pack(pady=10)
        
        # 선택된 파일 목록
        list_label = tk.Label(
            file_frame,
            text="선택된 파일:",
            font=("맑은 고딕", 10)
        )
        list_label.pack(anchor=tk.W)
        
        # 리스트박스와 스크롤바
        list_frame = tk.Frame(file_frame)
        list_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        scrollbar = tk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.file_listbox = tk.Listbox(
            list_frame,
            yscrollcommand=scrollbar.set,
            font=("맑은 고딕", 9)
        )
        self.file_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.file_listbox.yview)
        
        # 삭제 버튼
        remove_btn = tk.Button(
            file_frame,
            text="선택 항목 제거",
            command=self.remove_selected_file,
            font=("맑은 고딕", 10)
        )
        remove_btn.pack(pady=5)
        
        # 전송 경로 프레임
        path_frame = tk.Frame(self.root)
        path_frame.pack(pady=10, padx=20, fill=tk.X)
        
        path_label = tk.Label(
            path_frame,
            text="전송 경로:",
            font=("맑은 고딕", 10)
        )
        path_label.pack(anchor=tk.W)
        
        self.path_entry = tk.Entry(
            path_frame,
            font=("맑은 고딕", 10)
        )
        self.path_entry.insert(0, "/sdcard/Download")
        self.path_entry.pack(fill=tk.X, pady=5)
        
        path_info = tk.Label(
            path_frame,
            text="USB: /sdcard/Download  |  WiFi: /Download (또는 FTP 서버 설정에 따라)",
            font=("맑은 고딕", 8),
            fg="gray"
        )
        path_info.pack(anchor=tk.W)
        
        # 전송 버튼
        transfer_btn = tk.Button(
            self.root,
            text="파일 전송",
            command=self.transfer_files,
            font=("맑은 고딕", 14, "bold"),
            bg="#2196F3",
            fg="white",
            width=20,
            height=2
        )
        transfer_btn.pack(pady=20)
        
        # 진행 상황
        self.progress_var = tk.StringVar(value="")
        progress_label = tk.Label(
            self.root,
            textvariable=self.progress_var,
            font=("맑은 고딕", 10),
            fg="blue"
        )
        progress_label.pack(pady=5)
        
        self.progress_bar = ttk.Progressbar(
            self.root,
            mode='indeterminate',
            length=400
        )
        self.progress_bar.pack(pady=5)
        
        # 초기 모드 설정
        self.on_mode_change()
    
    def on_mode_change(self):
        """전송 방식 변경 시 UI 업데이트"""
        if self.transfer_mode.get() == "usb":
            self.wifi_frame.pack_forget()
            self.check_adb_available()
            self.check_device_connection()
        else:
            self.wifi_frame.pack(pady=10, padx=20, fill=tk.X, before=self.refresh_btn.master)
            self.status_label.config(
                text="FTP 서버 정보를 입력하고 '연결 확인'을 클릭하세요",
                fg="black"
            )
    
    def check_connection(self):
        """연결 확인 (모드에 따라 다름)"""
        if self.transfer_mode.get() == "usb":
            self.check_device_connection()
        else:
            self.check_ftp_connection()
    
    def check_adb_available(self):
        """ADB가 설치되어 있는지 확인"""
        try:
            result = subprocess.run(
                ["adb", "version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode != 0:
                messagebox.showerror(
                    "오류",
                    "ADB를 찾을 수 없습니다.\n\n"
                    "Android SDK Platform Tools를 설치하고\n"
                    "PATH에 추가해주세요.\n\n"
                    "다운로드: https://developer.android.com/studio/releases/platform-tools"
                )
                return False
            return True
        except FileNotFoundError:
            messagebox.showerror(
                "오류",
                "ADB를 찾을 수 없습니다.\n\n"
                "Android SDK Platform Tools를 설치하고\n"
                "PATH에 추가해주세요.\n\n"
                "다운로드: https://developer.android.com/studio/releases/platform-tools"
            )
            return False
        except Exception as e:
            messagebox.showerror("오류", f"ADB 확인 중 오류 발생: {str(e)}")
            return False
    
    def check_device_connection(self):
        """안드로이드 기기 연결 확인"""
        def check():
            try:
                result = subprocess.run(
                    ["adb", "devices"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                lines = result.stdout.strip().split('\n')[1:]  # 첫 줄은 "List of devices attached" 제외
                devices = [line for line in lines if line.strip() and 'device' in line]
                
                if devices:
                    device_info = devices[0].split('\t')[0]
                    self.device_connected = True
                    self.status_label.config(
                        text=f"기기 상태: 연결됨 ({device_info})",
                        fg="green"
                    )
                else:
                    self.device_connected = False
                    self.status_label.config(
                        text="기기 상태: 연결되지 않음\n(USB 디버깅을 활성화하고 기기를 연결하세요)",
                        fg="red"
                    )
            except Exception as e:
                self.device_connected = False
                self.status_label.config(
                    text=f"기기 상태: 확인 실패 ({str(e)})",
                    fg="red"
                )
        
        threading.Thread(target=check, daemon=True).start()
    
    def check_ftp_connection(self):
        """FTP 서버 연결 확인"""
        def check():
            ip = self.ip_entry.get().strip()
            port = self.port_entry.get().strip()
            username = self.user_entry.get().strip()
            password = self.pass_entry.get().strip()
            
            if not ip or not port:
                self.status_label.config(
                    text="IP 주소와 포트를 입력해주세요",
                    fg="red"
                )
                self.device_connected = False
                return
            
            try:
                port_int = int(port)
                # 포트 연결 테스트
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(3)
                result = sock.connect_ex((ip, port_int))
                sock.close()
                
                if result != 0:
                    self.status_label.config(
                        text=f"FTP 서버에 연결할 수 없습니다\n(IP: {ip}, Port: {port})",
                        fg="red"
                    )
                    self.device_connected = False
                    return
                
                # FTP 로그인 테스트
                ftp = FTP()
                ftp.connect(ip, port_int, timeout=5)
                ftp.login(username, password)
                ftp.quit()
                
                self.device_connected = True
                self.status_label.config(
                    text=f"FTP 서버 연결됨 ({ip}:{port})",
                    fg="green"
                )
            except ValueError:
                self.status_label.config(
                    text="포트는 숫자여야 합니다",
                    fg="red"
                )
                self.device_connected = False
            except Exception as e:
                self.device_connected = False
                error_msg = str(e)
                if "timed out" in error_msg.lower() or "refused" in error_msg.lower():
                    self.status_label.config(
                        text=f"FTP 서버에 연결할 수 없습니다\n(IP: {ip}, Port: {port})\n\n안드로이드에서 FTP 서버 앱이 실행 중인지 확인하세요",
                        fg="red"
                    )
                elif "530" in error_msg or "login" in error_msg.lower():
                    self.status_label.config(
                        text=f"FTP 로그인 실패\n사용자명/비밀번호를 확인하세요",
                        fg="red"
                    )
                else:
                    self.status_label.config(
                        text=f"연결 오류: {error_msg}",
                        fg="red"
                    )
        
        threading.Thread(target=check, daemon=True).start()
    
    def select_files(self):
        """파일 선택 다이얼로그"""
        files = filedialog.askopenfilenames(
            title="전송할 파일 선택",
            filetypes=[("모든 파일", "*.*")]
        )
        
        if files:
            for file in files:
                if file not in self.selected_files:
                    self.selected_files.append(file)
                    self.file_listbox.insert(tk.END, os.path.basename(file))
    
    def remove_selected_file(self):
        """선택된 파일 제거"""
        selection = self.file_listbox.curselection()
        if selection:
            index = selection[0]
            self.file_listbox.delete(index)
            del self.selected_files[index]
    
    def transfer_files(self):
        """파일 전송"""
        if not self.device_connected:
            if self.transfer_mode.get() == "usb":
                messagebox.showerror(
                    "오류",
                    "안드로이드 기기가 연결되지 않았습니다.\n"
                    "기기를 연결하고 USB 디버깅을 활성화해주세요."
                )
            else:
                messagebox.showerror(
                    "오류",
                    "FTP 서버에 연결되지 않았습니다.\n"
                    "안드로이드에서 FTP 서버 앱을 실행하고\n"
                    "연결 정보를 확인한 후 '연결 확인'을 클릭하세요."
                )
            return
        
        if not self.selected_files:
            messagebox.showwarning("경고", "전송할 파일을 선택해주세요.")
            return
        
        target_path = self.path_entry.get().strip()
        if not target_path:
            messagebox.showwarning("경고", "전송 경로를 입력해주세요.")
            return
        
        # 전송 시작
        if self.transfer_mode.get() == "usb":
            threading.Thread(
                target=self._transfer_files_usb_thread,
                args=(target_path,),
                daemon=True
            ).start()
        else:
            threading.Thread(
                target=self._transfer_files_ftp_thread,
                args=(target_path,),
                daemon=True
            ).start()
    
    def _transfer_files_usb_thread(self, target_path):
        """USB/ADB 파일 전송 스레드"""
        self.progress_bar.start()
        success_count = 0
        fail_count = 0
        
        for i, file_path in enumerate(self.selected_files):
            filename = os.path.basename(file_path)
            self.progress_var.set(f"전송 중: {filename} ({i+1}/{len(self.selected_files)})")
            
            try:
                # adb push 명령 실행
                result = subprocess.run(
                    ["adb", "push", file_path, f"{target_path}/{filename}"],
                    capture_output=True,
                    text=True,
                    timeout=300  # 5분 타임아웃
                )
                
                if result.returncode == 0:
                    success_count += 1
                else:
                    fail_count += 1
                    print(f"전송 실패: {filename}\n{result.stderr}")
            except subprocess.TimeoutExpired:
                fail_count += 1
                print(f"전송 타임아웃: {filename}")
            except Exception as e:
                fail_count += 1
                print(f"전송 오류: {filename}\n{str(e)}")
        
        self._show_transfer_result(success_count, fail_count)
    
    def _transfer_files_ftp_thread(self, target_path):
        """FTP 파일 전송 스레드"""
        self.progress_bar.start()
        success_count = 0
        fail_count = 0
        
        ip = self.ip_entry.get().strip()
        port = int(self.port_entry.get().strip())
        username = self.user_entry.get().strip()
        password = self.pass_entry.get().strip()
        
        try:
            # FTP 연결
            ftp = FTP()
            ftp.connect(ip, port, timeout=10)
            ftp.login(username, password)
            
            # 전송 경로로 이동
            try:
                ftp.cwd(target_path)
            except:
                # 경로가 없으면 생성 시도
                try:
                    ftp.mkd(target_path)
                    ftp.cwd(target_path)
                except:
                    pass  # 경로 생성 실패해도 계속 진행
            
            # 파일 전송
            for i, file_path in enumerate(self.selected_files):
                filename = os.path.basename(file_path)
                self.progress_var.set(f"전송 중: {filename} ({i+1}/{len(self.selected_files)})")
                
                try:
                    with open(file_path, 'rb') as file:
                        ftp.storbinary(f'STOR {filename}', file)
                    success_count += 1
                except Exception as e:
                    fail_count += 1
                    print(f"전송 실패: {filename}\n{str(e)}")
            
            ftp.quit()
        except Exception as e:
            fail_count = len(self.selected_files)
            print(f"FTP 연결 오류: {str(e)}")
            self.progress_bar.stop()
            messagebox.showerror(
                "전송 실패",
                f"FTP 서버 연결 중 오류가 발생했습니다.\n\n{str(e)}"
            )
            return
        
        self._show_transfer_result(success_count, fail_count)
    
    def _show_transfer_result(self, success_count, fail_count):
        """전송 결과 표시"""
        self.progress_bar.stop()
        
        # 결과 메시지
        if fail_count == 0:
            self.progress_var.set(f"전송 완료! ({success_count}개 파일)")
            messagebox.showinfo(
                "완료",
                f"모든 파일이 성공적으로 전송되었습니다.\n\n"
                f"전송된 파일: {success_count}개"
            )
        else:
            self.progress_var.set(f"전송 완료 (성공: {success_count}, 실패: {fail_count})")
            messagebox.showwarning(
                "전송 완료",
                f"파일 전송이 완료되었습니다.\n\n"
                f"성공: {success_count}개\n"
                f"실패: {fail_count}개"
            )
        
        # 파일 목록 초기화
        self.selected_files.clear()
        self.file_listbox.delete(0, tk.END)


def main():
    root = tk.Tk()
    app = AndroidFileTransfer(root)
    root.mainloop()


if __name__ == "__main__":
    main()


