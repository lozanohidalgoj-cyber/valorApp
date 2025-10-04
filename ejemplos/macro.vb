Sub AhoraLimpiar()
'
' AhoraLimpiar Macro
' Limpia la hoja para realizar una nueva valoración.
'

'
    Range("C2").Select
    Selection.ClearContents
    Range("E2").Select
    Selection.ClearContents
    Range("F2").Select
    Selection.ClearContents
    Range("H2").Select
    Selection.ClearContents
    Range("G2").Select
    ActiveCell.FormulaR1C1 = "=Listado!R[28]C[22]"
    Range("H2").Select
    Selection.ClearContents
    Range("A5").Select
    ActiveCell.FormulaR1C1 = "='Entrada datos'!R[-3]C[2]"
    Range("A5").Select
    Selection.AutoFill Destination:=Range("A5:B5"), Type:=xlFillDefault
    Range("A5:B5").Select
    Range("C5").Select
    ActiveCell.FormulaR1C1 = "='Entrada datos'!R[-3]C[4]"
    Range("C5").Select
    Selection.AutoFill Destination:=Range("C5:D5"), Type:=xlFillDefault
    Range("C5:D5").Select
    Range("E5").Select
    ActiveCell.FormulaR1C1 = "=RC[-1]-RC[-2]"
    Range("F5").Select
    ActiveCell.FormulaR1C1 = "=IF(RC[-2]<=R2C3,""no procede"",""Refacturar"")"
    Range("G5").Select
    ActiveCell.FormulaR1C1 = "='Entrada datos'!R[-3]C[9]"
    Range("G5").Select
    Selection.AutoFill Destination:=Range("G5:L5"), Type:=xlFillDefault
    Range("G5:L5").Select
    Range("S5").Select
    ActiveCell.FormulaR1C1 = "Tipo V"
    Range("A5:S5").Select
    Selection.AutoFill Destination:=Range("A5:S200"), Type:=xlFillDefault
    Range("A5:R200").Select
    ActiveWindow.ScrollColumn = 3
    ActiveWindow.ScrollColumn = 2
    ActiveWindow.ScrollColumn = 1
    Range("A5:R200").Select
    Range("A6").Activate
    ActiveWindow.SmallScroll Down:=-27
    Range("M5:R200").Select
    Selection.ClearContents
    ActiveCell.FormulaR1C1 = "=SUM(R[3]C[-3]:R[198]C[2])"
    Range("L2:M2").Select
    ActiveCell.FormulaR1C1 = "=SUBTOTAL(109,R[3]C[1]:R[198]C[6])"
    Range("M5").Select
    Selection.ClearContents
    Range("J2:K2").Select
    ActiveCell.FormulaR1C1 = "=SUBTOTAL(109,R[3]C[-3]:R[198]C[2])"
    Range("D2").Select
    ActiveCell.FormulaR1C1 = "=TODAY()"
    ActiveSheet.Range("$A$4:$R$200").AutoFilter Field:=6
    Range("M5:R200").Select
    Selection.ClearContents
    Range("C2").Select
    ActiveWorkbook.RefreshAll
   End Sub


Sub Guardar_PDF()
'
' Guarar_PDF Macro
' Abre PDF y lo guarda en la carpeta AD Expedientes para imprimir y añadir a SCE.
'

'
    Sheets("Resumen").Select
    Sheets("Resumen").Copy
    ChDir "C:\AD Expedientes"
    ActiveSheet.ExportAsFixedFormat Type:=xlTypePDF, Filename:= _
        "C:\AD Expedientes\Análisis de consumos.pdf", Quality:=xlQualityStandard, _
        IncludeDocProperties:=True, IgnorePrintAreas:=False, OpenAfterPublish:= _
        True
    ActiveWorkbook.Close Savechanges:=False
End Sub


Sub ImprimirListado()
'
' ImprimirListado Macro
' Prepara listado para imprimir a hoja simple y a color.
'

'
    ActiveWindow.SmallScroll Down:=-21
    ActiveSheet.Range("$D$1:$D$200").AutoFilter Field:=1, Criteria1:="<>"
    ActiveWindow.SmallScroll Down:=-30
    ActiveWindow.SelectedSheets.PrintOut Copies:=1, Collate:=True, _
        IgnorePrintAreas:=False
End Sub


Sub MetodoCerrarLibrosinGuardarCambios()
ActiveWorkbook.Close Savechanges:=False
End Sub


Sub Cambiar_inicio_mes()
'
' Cambiar_inicio_mes Macro
' Alterna entre inicio de mes para que sea 1 o 31.
'
' Acceso directo: CTRL+j
'

    Application.ScreenUpdating = False
    Application.Sheets("Suma").Visible = True
    Sheets("Suma").Select
    Range("AT2").Select
    ActiveCell.FormulaR1C1 = "=YEAR(RC[-40])"
    Range("AU2").Select
    ActiveCell.FormulaR1C1 = "=TEXT(RC[-41],""mmmm"")"
    Range("AT2:AU2").Select
    Selection.AutoFill Destination:=Range("AT2:AU200")
    Range("AT2:AU200").Select
    ActiveWindow.ScrollRow = 2
    ActiveWindow.ScrollRow = 4
    ActiveWindow.ScrollRow = 6
    ActiveWindow.ScrollRow = 8
    ActiveWindow.ScrollRow = 10
    ActiveWindow.ScrollRow = 12
    ActiveWindow.ScrollRow = 15
    ActiveWindow.ScrollRow = 18
    ActiveWindow.ScrollRow = 21
    ActiveWindow.ScrollRow = 25
    ActiveWindow.ScrollRow = 30
    ActiveWindow.ScrollRow = 34
    ActiveWindow.ScrollRow = 40
    ActiveWindow.ScrollRow = 45
    ActiveWindow.ScrollRow = 50
    ActiveWindow.ScrollRow = 56
    ActiveWindow.ScrollRow = 61
    ActiveWindow.ScrollRow = 66
    ActiveWindow.ScrollRow = 71
    ActiveWindow.ScrollRow = 76
    ActiveWindow.ScrollRow = 82
    ActiveWindow.ScrollRow = 88
    ActiveWindow.ScrollRow = 94
    ActiveWindow.ScrollRow = 105
    ActiveWindow.ScrollRow = 111
    ActiveWindow.ScrollRow = 117
    ActiveWindow.ScrollRow = 122
    ActiveWindow.ScrollRow = 127
    ActiveWindow.ScrollRow = 136
    ActiveWindow.ScrollRow = 140
    ActiveWindow.ScrollRow = 144
    ActiveWindow.ScrollRow = 148
    ActiveWindow.ScrollRow = 152
    ActiveWindow.ScrollRow = 162
    ActiveWindow.ScrollRow = 166
    ActiveWindow.ScrollRow = 171
    ActiveWindow.ScrollRow = 175
    ActiveWindow.ScrollRow = 177
    ActiveWindow.ScrollRow = 179
    ActiveWindow.ScrollRow = 181
    ActiveWindow.ScrollRow = 182
    ActiveWindow.ScrollRow = 184
    ActiveWindow.ScrollRow = 186
    ActiveWindow.ScrollRow = 188
    ActiveWindow.ScrollRow = 189
    ActiveWindow.ScrollRow = 190
    ActiveWindow.ScrollRow = 191
    ActiveWindow.ScrollRow = 193
    ActiveWindow.ScrollRow = 194
    ActiveWindow.ScrollRow = 195
    ActiveWindow.ScrollRow = 198
    ActiveWindow.ScrollRow = 200
    ActiveWindow.ScrollRow = 201
    ActiveWindow.ScrollRow = 204
    ActiveWindow.ScrollRow = 205
    ActiveWindow.ScrollRow = 208
    ActiveWindow.ScrollRow = 211
    ActiveWindow.ScrollRow = 214
    ActiveWindow.ScrollRow = 217
    ActiveWindow.ScrollRow = 220
    ActiveWindow.ScrollRow = 223
    ActiveWindow.ScrollRow = 228
    ActiveWindow.ScrollRow = 229
    ActiveWindow.ScrollRow = 230
    ActiveWindow.ScrollRow = 231
    ActiveWindow.ScrollRow = 232
    ActiveWindow.ScrollRow = 233
    ActiveWindow.ScrollRow = 234
    ActiveWindow.ScrollRow = 235
    ActiveWindow.ScrollRow = 234
    ActiveWindow.ScrollRow = 233
    ActiveWindow.ScrollRow = 231
    ActiveWindow.ScrollRow = 229
    ActiveWindow.ScrollRow = 228
    ActiveWindow.ScrollRow = 225
    ActiveWindow.ScrollRow = 221
    ActiveWindow.ScrollRow = 218
    ActiveWindow.ScrollRow = 214
    ActiveWindow.ScrollRow = 209
    ActiveWindow.ScrollRow = 206
    ActiveWindow.ScrollRow = 204
    ActiveWindow.ScrollRow = 202
    ActiveWindow.ScrollRow = 201
    ActiveWindow.ScrollRow = 200
    ActiveWindow.ScrollRow = 199
    ActiveWindow.ScrollRow = 198
    ActiveWindow.ScrollRow = 197
    ActiveWindow.ScrollRow = 196
    ActiveWindow.ScrollRow = 195
    ActiveWindow.ScrollRow = 194
    ActiveWindow.ScrollRow = 193
    ActiveWindow.ScrollRow = 192
    ActiveWindow.ScrollRow = 191
    ActiveWindow.ScrollRow = 190
    ActiveWindow.ScrollRow = 189
    ActiveWindow.ScrollRow = 188
    ActiveWindow.ScrollRow = 187
    ActiveWindow.ScrollRow = 185
    ActiveWindow.ScrollRow = 184
    ActiveWindow.ScrollRow = 182
    ActiveWindow.ScrollRow = 181
    ActiveWindow.ScrollRow = 180
    ActiveWindow.ScrollRow = 179
    ActiveWindow.ScrollRow = 178
    ActiveWindow.ScrollRow = 177
    ActiveWindow.ScrollRow = 176
    ActiveWindow.ScrollRow = 173
    ActiveWindow.ScrollRow = 172
    ActiveWindow.ScrollRow = 170
    ActiveWindow.ScrollRow = 169
    ActiveWindow.ScrollRow = 167
    ActiveWindow.ScrollRow = 166
    ActiveWindow.ScrollRow = 164
    ActiveWindow.ScrollRow = 161
    ActiveWindow.ScrollRow = 158
    ActiveWindow.ScrollRow = 156
    ActiveWindow.ScrollRow = 152
    ActiveWindow.ScrollRow = 150
    ActiveWindow.ScrollRow = 147
    ActiveWindow.ScrollRow = 145
    ActiveWindow.ScrollRow = 142
    ActiveWindow.ScrollRow = 140
    ActiveWindow.ScrollRow = 138
    ActiveWindow.ScrollRow = 136
    ActiveWindow.ScrollRow = 133
    ActiveWindow.ScrollRow = 130
    ActiveWindow.ScrollRow = 128
    ActiveWindow.ScrollRow = 124
    ActiveWindow.ScrollRow = 121
    ActiveWindow.ScrollRow = 119
    ActiveWindow.ScrollRow = 114
    ActiveWindow.ScrollRow = 112
    ActiveWindow.ScrollRow = 109
    ActiveWindow.ScrollRow = 106
    ActiveWindow.ScrollRow = 104
    ActiveWindow.ScrollRow = 102
    ActiveWindow.ScrollRow = 100
    ActiveWindow.ScrollRow = 98
    ActiveWindow.ScrollRow = 95
    ActiveWindow.ScrollRow = 93
    ActiveWindow.ScrollRow = 91
    ActiveWindow.ScrollRow = 89
    ActiveWindow.ScrollRow = 85
    ActiveWindow.ScrollRow = 82
    ActiveWindow.ScrollRow = 78
    ActiveWindow.ScrollRow = 75
    ActiveWindow.ScrollRow = 72
    ActiveWindow.ScrollRow = 68
    ActiveWindow.ScrollRow = 64
    ActiveWindow.ScrollRow = 62
    ActiveWindow.ScrollRow = 60
    ActiveWindow.ScrollRow = 57
    ActiveWindow.ScrollRow = 56
    ActiveWindow.ScrollRow = 54
    ActiveWindow.ScrollRow = 53
    ActiveWindow.ScrollRow = 52
    ActiveWindow.ScrollRow = 51
    ActiveWindow.ScrollRow = 48
    ActiveWindow.ScrollRow = 47
    ActiveWindow.ScrollRow = 45
    ActiveWindow.ScrollRow = 43
    ActiveWindow.ScrollRow = 41
    ActiveWindow.ScrollRow = 39
    ActiveWindow.ScrollRow = 37
    ActiveWindow.ScrollRow = 35
    ActiveWindow.ScrollRow = 32
    ActiveWindow.ScrollRow = 31
    ActiveWindow.ScrollRow = 29
    ActiveWindow.ScrollRow = 26
    ActiveWindow.ScrollRow = 23
    ActiveWindow.ScrollRow = 21
    ActiveWindow.ScrollRow = 19
    ActiveWindow.ScrollRow = 16
    ActiveWindow.ScrollRow = 15
    ActiveWindow.ScrollRow = 13
    ActiveWindow.ScrollRow = 10
    ActiveWindow.ScrollRow = 9
    ActiveWindow.ScrollRow = 7
    ActiveWindow.ScrollRow = 6
    ActiveWindow.ScrollRow = 4
    ActiveWindow.ScrollRow = 3
    ActiveWindow.ScrollRow = 2
    ActiveWindow.ScrollRow = 1
    Sheets("Vista por años").Select
    Application.Sheets("Suma").Visible = False
    Application.ScreenUpdating = True
    ActiveWorkbook.RefreshAll
End Sub


Sub Volver_atras_macro_anterior()
'
' Volver_atras_macro_anterior Macro
'

'
    Application.ScreenUpdating = False
    Application.Sheets("Suma").Visible = True
    Sheets("Suma").Select
    Range("AT2").Select
    ActiveCell.FormulaR1C1 = "=YEAR(RC[-41])"
    Range("AU2").Select
    ActiveCell.FormulaR1C1 = "=TEXT(RC[-42],""mmmm"")"
    Range("AT2:AU2").Select
    Selection.AutoFill Destination:=Range("AT2:AU200")
    Range("AT2:AU200").Select
    Sheets("Vista por años").Select
    Application.Sheets("Suma").Visible = False
    Application.ScreenUpdating = True
    ActiveWorkbook.RefreshAll
End Sub


Sub Campaña_Proactivo()
'
' Campaña_Proactivo Macro
' Genera PDF para incluir suministro en la carpeta Campaña Proactivo.

On Error GoTo aviso
Dim xcel As String
Dim zfilename As String
Dim outName As String, i As Long

Dim archivo As String
Dim ano As String


archivo = Range("D2")
ano = Range("F1")

outName = archivo

zfilename = "C:\AD Expedientes\Campaña Proactiva" & "\" & outName & " " & ano '

ActiveSheet.ExportAsFixedFormat xlTypePDF, zfilename
Exit Sub
aviso:
MsgBox "Error: " & Err.Description & " " & Err.Number

End Sub


Sub Guardar_Libro_Como()
'
' Guardar_Libro_Como Macro
' Guarda libro en la carpeta habilitada y lo hace con el número de póliza y con el nombre que le habilitemos en la hoja Resumen.
'
cadena = "C:\AD Expedientes\Suministros analizados AD Expedientes\" & Range("A201") & "_" & "Póliza ATR nº" & " " & Range("A202") & ".xlsm"
ActiveWorkbook.SaveAs cadena, FileFormat:= _
xlOpenXMLWorkbookMacroEnabled, Password:="", WriteResPassword:="", ReadOnlyRecommended:=False _
, CreateBackup:=False
ActiveWorkbook.Save
Sheets("Vista por años").Select
ActiveWorkbook.Close
End Sub


Sub Imprimir_Resumen()
'
' Imprimir_Resumen Macro
' Imprime directamente el resumen sin crear PDF, y lo hace en color a una hoja.
'

    ActiveWindow.SelectedSheets.PrintOut Copies:=1, Collate:=True, _
        IgnorePrintAreas:=False
End Sub


Sub AhoraValidarPeriodo()
'
' AhoraValidarPeriodo Macro
'

'
    Sheets("Entrada datos").Select
    ActiveWindow.ScrollColumn = 2
    ActiveWindow.ScrollColumn = 3
    ActiveWindow.ScrollColumn = 4
    ActiveWindow.ScrollColumn = 5
    ActiveWindow.ScrollColumn = 6
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 11
    ActiveWindow.ScrollColumn = 12
    ActiveWindow.ScrollColumn = 13
    ActiveWindow.ScrollColumn = 14
    ActiveWindow.ScrollColumn = 15
    ActiveWindow.ScrollColumn = 16
    ActiveWindow.ScrollColumn = 17
    ActiveWindow.ScrollColumn = 18
    ActiveWindow.ScrollColumn = 19
    ActiveWindow.ScrollColumn = 20
    ActiveWindow.ScrollColumn = 21
    Range("AH2").Select
    ActiveCell.FormulaR1C1 = "=SUBTOTAL(4,Valoración!R[3]C[-21])"
    Range("AH2").Select
    Selection.AutoFill Destination:=Range("AH2:AM2"), Type:=xlFillDefault
    Range("AH2:AM2").Select
    Selection.AutoFill Destination:=Range("AH2:AM200"), Type:=xlFillDefault
    Range("AH2:AM200").Select
    ActiveWindow.ScrollRow = 176
    ActiveWindow.ScrollRow = 174
    ActiveWindow.ScrollRow = 172
    ActiveWindow.ScrollRow = 171
    ActiveWindow.ScrollRow = 170
    ActiveWindow.ScrollRow = 169
    ActiveWindow.ScrollRow = 167
    ActiveWindow.ScrollRow = 166
    ActiveWindow.ScrollRow = 163
    ActiveWindow.ScrollRow = 160
    ActiveWindow.ScrollRow = 158
    ActiveWindow.ScrollRow = 155
    ActiveWindow.ScrollRow = 152
    ActiveWindow.ScrollRow = 149
    ActiveWindow.ScrollRow = 145
    ActiveWindow.ScrollRow = 141
    ActiveWindow.ScrollRow = 137
    ActiveWindow.ScrollRow = 132
    ActiveWindow.ScrollRow = 128
    ActiveWindow.ScrollRow = 123
    ActiveWindow.ScrollRow = 118
    ActiveWindow.ScrollRow = 113
    ActiveWindow.ScrollRow = 108
    ActiveWindow.ScrollRow = 103
    ActiveWindow.ScrollRow = 99
    ActiveWindow.ScrollRow = 93
    ActiveWindow.ScrollRow = 87
    ActiveWindow.ScrollRow = 81
    ActiveWindow.ScrollRow = 74
    ActiveWindow.ScrollRow = 66
    ActiveWindow.ScrollRow = 61
    ActiveWindow.ScrollRow = 53
    ActiveWindow.ScrollRow = 47
    ActiveWindow.ScrollRow = 32
    ActiveWindow.ScrollRow = 26
    ActiveWindow.ScrollRow = 16
    ActiveWindow.ScrollRow = 12
    ActiveWindow.ScrollRow = 6
    ActiveWindow.ScrollRow = 3
    ActiveWindow.ScrollRow = 1
    ActiveWindow.ScrollColumn = 24
    Sheets("Valoración").Select
    Range("D2").Select
    ActiveCell.FormulaR1C1 = "=SUBTOTAL(4,R[3]C:R[198]C)"
    Range("D3").Select
    ActiveSheet.Range("$A$4:$R$200").AutoFilter Field:=6, Criteria1:= _
    "Refacturar"
    ActiveWindow.SmallScroll Down:=-222
    Range("C2").Select
    Selection.Copy
    Range("E2").Select
    ActiveWorkbook.RefreshAll
End Sub


Sub Sumar_P2()
'
' Sumar_P2 Macro
'

'
    Range("V5:V200").Select
    Selection.Copy
    ActiveWindow.SmallScroll Down:=-167
    Range("W5").Select
    Selection.PasteSpecial Paste:=xlPasteValues, Operation:=xlNone, SkipBlanks _
        :=False, Transpose:=False
    Range("G5:I200").Select
    Application.CutCopyMode = False
    Selection.ClearContents
    Range("W5:W200").Select
    Range("W200").Activate
    Selection.Copy
    Range("H5").Select
    Selection.PasteSpecial Paste:=xlPasteValues, Operation:=xlNone, SkipBlanks _
        :=False, Transpose:=False
    Range("W5:W200").Select
    Application.CutCopyMode = False
    Selection.ClearContents
    ActiveWindow.ScrollRow = 170
    ActiveWindow.ScrollRow = 169
    ActiveWindow.ScrollRow = 158
    ActiveWindow.ScrollRow = 155
    ActiveWindow.ScrollRow = 130
    ActiveWindow.ScrollRow = 124
    ActiveWindow.ScrollRow = 98
    ActiveWindow.ScrollRow = 88
    ActiveWindow.ScrollRow = 65
    ActiveWindow.ScrollRow = 60
    ActiveWindow.ScrollRow = 50
    ActiveWindow.ScrollRow = 46
    ActiveWindow.ScrollRow = 16
    ActiveWindow.ScrollRow = 12
    ActiveWindow.ScrollRow = 5
    Columns("V:W").Select
    Selection.EntireColumn.Hidden = True
    Range("C2").Select
End Sub

Sub CopiarComentario()
'
' CopiarComentario Macro
' Copia el comentario para pegarlo en SCE.
'

'
    ActiveWindow.ScrollColumn = 2
    ActiveWindow.ScrollColumn = 6
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 11
    ActiveWindow.ScrollColumn = 12
    Range("AA1:AA20").Select
    Selection.Copy
    ActiveWindow.SmallScroll Down:=-45
    ActiveWindow.ScrollColumn = 11
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 6
    ActiveWindow.ScrollColumn = 5
    ActiveWindow.ScrollColumn = 4
    ActiveWindow.ScrollColumn = 3
    ActiveWindow.ScrollColumn = 2
    ActiveWindow.ScrollColumn = 1
    Range("A1").Select
    ActiveWindow.ScrollColumn = 2
    ActiveWindow.ScrollColumn = 3
    ActiveWindow.ScrollColumn = 4
    ActiveWindow.ScrollColumn = 5
    ActiveWindow.ScrollColumn = 6
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 11
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 5
    ActiveWindow.ScrollColumn = 4
    ActiveWindow.ScrollColumn = 2
    ActiveWindow.ScrollColumn = 1
End Sub

Sub Realizar_Simulación_Enofa_2()
'
' Realizar_Simulación_Enofa_2 Macro
'

'
    Range("K3:K200").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorAccent1
        .TintAndShade = 0
        .PatternTintAndShade = 0
    End With
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Selection.Font.Bold = True
    With Selection
        .HorizontalAlignment = xlCenter
        .VerticalAlignment = xlBottom
        .WrapText = False
        .Orientation = 0
        .AddIndent = False
        .IndentLevel = 0
        .ShrinkToFit = False
        .ReadingOrder = xlContext
        .MergeCells = False
    End With
    Selection.ClearContents
    ActiveWindow.ScrollColumn = 2
    ActiveWindow.ScrollColumn = 3
    ActiveWindow.ScrollColumn = 4
    ActiveWindow.ScrollColumn = 5
    ActiveWindow.ScrollColumn = 6
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 11
    ActiveWindow.ScrollColumn = 12
    ActiveWindow.ScrollColumn = 13
    ActiveWindow.ScrollColumn = 14
    ActiveWindow.ScrollColumn = 15
    ActiveWindow.ScrollColumn = 16
    Range("AB3").Select
    ActiveCell.FormulaR1C1 = "=IF(RC11=""Simular"",RC[-12]*R1C17-RC[-12],"""")"
    Range("AB3").Select
    Selection.AutoFill Destination:=Range("AB3:AG3"), Type:=xlFillDefault
    Range("AB3:AG3").Select
    Selection.AutoFill Destination:=Range("AB3:AG200"), Type:=xlFillDefault
    Range("AB3:AG200").Select
    ActiveWindow.SmallScroll Down:=-192
    ActiveWindow.ScrollColumn = 18
    ActiveWindow.ScrollColumn = 17
    ActiveWindow.ScrollColumn = 16
    ActiveWindow.ScrollColumn = 15
    ActiveWindow.ScrollColumn = 14
    ActiveWindow.ScrollColumn = 13
    ActiveWindow.ScrollColumn = 12
    ActiveWindow.ScrollColumn = 11
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 10
    Range("P1").Select
    ActiveCell.FormulaR1C1 = "Constante:"
    Range("P1:Q1").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .Color = 192
        .TintAndShade = 0
        .PatternTintAndShade = 0
    End With
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Selection.Font.Bold = True
    Range("P1").Select
    With Selection
        .HorizontalAlignment = xlRight
        .VerticalAlignment = xlBottom
        .WrapText = False
        .Orientation = 0
        .AddIndent = False
        .IndentLevel = 0
        .ShrinkToFit = False
        .ReadingOrder = xlContext
        .MergeCells = False
    End With
    Range("P1").Select
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    With Selection.Borders(xlEdgeLeft)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeTop)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    Range("Q1").Select
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    With Selection.Borders(xlEdgeLeft)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeTop)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    Range("S1").Select
    ActiveCell.FormulaR1C1 = "Enofa - "
    Range("T1").Select
    ActiveCell.FormulaR1C1 = "=SUM(R[2]C[8]:R[199]C[13])"
    Range("S1:T1").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .Color = 192
        .TintAndShade = 0
        .PatternTintAndShade = 0
    End With
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Selection.Font.Bold = True
    Range("S1").Select
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    With Selection.Borders(xlEdgeLeft)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeTop)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    Range("S1:T1").Select
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    With Selection.Borders(xlEdgeLeft)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeTop)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    Range("U1").Select
    ActiveCell.FormulaR1C1 = "kWh."
    Range("S1:U1").Select
    Range("U1").Activate
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    Selection.Borders(xlEdgeLeft).LineStyle = xlNone
    Selection.Borders(xlEdgeTop).LineStyle = xlNone
    Selection.Borders(xlEdgeBottom).LineStyle = xlNone
    Selection.Borders(xlEdgeRight).LineStyle = xlNone
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    With Selection.Borders(xlEdgeLeft)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeTop)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    With Selection.Interior
        .PatternColorIndex = xlAutomatic
        .Color = 192
        .TintAndShade = 0
        .PatternTintAndShade = 0
    End With
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Selection.Font.Bold = True
    Range("R7").Select
    Sheets("Resumen").Select
    ActiveWindow.SmallScroll Down:=51
    Range("C74").Select
    ActiveCell.FormulaR1C1 = "='Entrada datos'!R[-73]C[16]"
    Range("C74").Select
    Selection.AutoFill Destination:=Range("C74:E74"), Type:=xlFillDefault
    Range("C74:E74").Select
    Range("C74:E74").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .Color = 192
        .TintAndShade = 0
        .PatternTintAndShade = 0
    End With
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Selection.Font.Bold = True
    Range("C74").Select
    With Selection
        .HorizontalAlignment = xlRight
        .VerticalAlignment = xlBottom
        .WrapText = False
        .Orientation = 0
        .AddIndent = False
        .IndentLevel = 0
        .ShrinkToFit = False
        .ReadingOrder = xlContext
        .MergeCells = False
    End With
    Range("C74:E74").Select
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    With Selection.Borders(xlEdgeLeft)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeTop)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    With Selection.Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    Range("H75").Select
    ActiveWindow.SmallScroll Down:=3
    Windows("Análisis de Expedientes.xlsm").Activate
    Sheets("Entrada datos").Select
    ActiveWindow.SmallScroll Down:=-30
    ActiveWindow.SmallScroll ToRight:=-4
    ActiveSheet.Shapes.AddShape(msoShapePentagon, 390.75, 292.5, 208.5, 99.75). _
        Select
    ActiveWindow.ScrollColumn = 5
    ActiveWindow.ScrollColumn = 6
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.SmallScroll ToRight:=-1
    ActiveWindow.ScrollColumn = 6
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 6
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.SmallScroll ToRight:=-1
    Selection.ShapeRange(1).TextFrame2.TextRange.Characters.Text = _
        "Para simular una refacturación se debe añadir la palabra """"Simular"""" en las filas que se desea refacturar siempre en la columna """"K"""" y añadir la constante de refacturación en la celda Q1. El resultado de la Enofa aparecerá en U1 y en el resumen."
    With Selection.ShapeRange(1).TextFrame2.TextRange.Characters(1, 233). _
        ParagraphFormat
        .FirstLineIndent = 0
        .Alignment = msoAlignLeft
    End With
    With Selection.ShapeRange(1).TextFrame2.TextRange.Characters(1, 12).Font
        .NameComplexScript = "+mn-cs"
        .NameFarEast = "+mn-ea"
        .Fill.Visible = msoTrue
        .Fill.ForeColor.ObjectThemeColor = msoThemeColorLight1
        .Fill.ForeColor.TintAndShade = 0
        .Fill.ForeColor.Brightness = 0
        .Fill.Transparency = 0
        .Fill.Solid
        .Size = 11
        .Name = "+mn-lt"
    End With
    With Selection.ShapeRange(1).TextFrame2.TextRange.Characters(13, 221).Font
        .BaselineOffset = 0
        .NameComplexScript = "+mn-cs"
        .NameFarEast = "+mn-ea"
        .Fill.Visible = msoTrue
        .Fill.ForeColor.ObjectThemeColor = msoThemeColorLight1
        .Fill.ForeColor.TintAndShade = 0
        .Fill.ForeColor.Brightness = 0
        .Fill.Transparency = 0
        .Fill.Solid
        .Size = 11
        .Name = "+mn-lt"
    End With
        Range("K3:K200").Select
    With Selection.Validation
        .Delete
        .Add Type:=xlValidateList, AlertStyle:=xlValidAlertStop, Operator:= _
        xlBetween, Formula1:="Simular"
        .IgnoreBlank = True
        .InCellDropdown = True
        .InputTitle = ""
        .ErrorTitle = ""
        .InputMessage = ""
        .ErrorMessage = ""
        .ShowInput = True
        .ShowError = True
    End With
    Range("Q1").Select
End Sub


Sub AhoraFR()
'
' AhoraFR Macro
'

'
    Range("M5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"",(R2C5*R2C6*RC5)*58.33%-RC[-6],IF(RC19=""Tipo IV"",(R2C5*R2C6*RC5)*11.83%-RC[-6],"""")))"
    Range("M5").Select
    Selection.AutoFill Destination:=Range("M5:N5"), Type:=xlFillDefault
    Range("M5:N5").Select
    Range("N5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"",(R2C5*R2C6*RC5)-RC[-6],IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R2C5*R2C6*RC5)*35.5%-RC[-6],"""")))"
    Range("N5").Select
    Selection.AutoFill Destination:=Range("N5:O5"), Type:=xlFillDefault
    Range("N5:O5").Select
    Range("M5").Select
    Selection.Copy
    Range("O5").Select
    ActiveSheet.Paste
    Range("O5").Select
    Application.CutCopyMode = False
    Range("O5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"",(R2C5*R2C6*RC5)*41.67%-RC[-6],IF(RC19=""Tipo IV"",(R2C5*R2C6*RC5)*23.67%-RC[-6],"""")))"
    Range("O5").Select
    Selection.AutoFill Destination:=Range("O5:P5"), Type:=xlFillDefault
    Range("O5:P5").Select
    Range("P5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R2C5*R2C6*RC5)*4.83%-RC[-6],"""")))"
    Range("P5").Select
    Selection.AutoFill Destination:=Range("P5:Q5"), Type:=xlFillDefault
    Range("P5:Q5").Select
    Range("Q5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R2C5*R2C6*RC5)*14.5%-RC[-6],"""")))"
    Range("Q5").Select
    Selection.AutoFill Destination:=Range("Q5:R5"), Type:=xlFillDefault
    Range("Q5:R5").Select
    Range("R5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R2C5*R2C6*RC5)*9.67%-RC[-6],"""")))"
        Range("M5:R5").Select
    Selection.AutoFill Destination:=Range("M5:R200")
    Range("M5:R200").Select
    Range("A2").Select
    ActiveWorkbook.RefreshAll
    
End Sub


Sub AhoraDA()
'
' AhoraDA Macro
'

    Range("M5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"",(R2C5*R2C6*RC5)*58.33%,IF(RC19=""Tipo IV"",(R2C5*R2C6*RC5)*11.83%,"""")))"
    Range("M5").Select
    Selection.AutoFill Destination:=Range("M5:N5"), Type:=xlFillDefault
    Range("M5:N5").Select
    Range("N5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"",(R2C5*R2C6*RC5),IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R2C5*R2C6*RC5)*35.5%,"""")))"
    Range("N5").Select
    Selection.AutoFill Destination:=Range("N5:O5"), Type:=xlFillDefault
    Range("N5:O5").Select
    Range("M5").Select
    Selection.Copy
    Range("O5").Select
    ActiveSheet.Paste
    Range("O5").Select
    Application.CutCopyMode = False
    Range("O5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"",(R2C5*R2C6*RC5)*41.67%,IF(RC19=""Tipo IV"",(R2C5*R2C6*RC5)*23.67%,"""")))"
    Range("O5").Select
    Selection.AutoFill Destination:=Range("O5:P5"), Type:=xlFillDefault
    Range("O5:P5").Select
    Range("P5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R2C5*R2C6*RC5)*4.83%,"""")))"
    Range("P5").Select
    Selection.AutoFill Destination:=Range("P5:Q5"), Type:=xlFillDefault
    Range("P5:Q5").Select
    Range("Q5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R2C5*R2C6*RC5)*14.5%,"""")))"
    Range("Q5").Select
    Selection.AutoFill Destination:=Range("Q5:R5"), Type:=xlFillDefault
    Range("Q5:R5").Select
    Range("R5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R2C5*R2C6*RC5)*9.67%,"""")))"
        Range("M5:R5").Select
    Selection.AutoFill Destination:=Range("M5:R200")
    Range("M5:R200").Select
    Range("A2").Select
    ActiveWorkbook.RefreshAll
    
End Sub


Sub ValidarFechas()
'
' Validar fechas Macro
'

'
Sheets("Entrada datos").Select
    ActiveWindow.ScrollColumn = 2
    ActiveWindow.ScrollColumn = 3
    ActiveWindow.ScrollColumn = 4
    ActiveWindow.ScrollColumn = 5
    ActiveWindow.ScrollColumn = 6
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 11
    ActiveWindow.ScrollColumn = 12
    ActiveWindow.ScrollColumn = 13
    ActiveWindow.ScrollColumn = 14
    ActiveWindow.ScrollColumn = 15
    ActiveWindow.ScrollColumn = 16
    ActiveWindow.ScrollColumn = 17
    ActiveWindow.ScrollColumn = 18
    ActiveWindow.ScrollColumn = 19
    ActiveWindow.ScrollColumn = 20
    ActiveWindow.ScrollColumn = 21
    ActiveWindow.ScrollColumn = 22
    ActiveWindow.ScrollColumn = 23
    ActiveWindow.ScrollColumn = 24
    Range("AH3").Select
    ActiveCell.FormulaR1C1 = "=SUBTOTAL(5,Valoración!R[2]C[-21])"
    Range("AH3").Select
    Selection.NumberFormat = "0.000"
    Selection.NumberFormat = "0.00"
    Selection.NumberFormat = "0.0"
    Selection.NumberFormat = "0"
    Selection.AutoFill Destination:=Range("AH3:AM3"), Type:=xlFillDefault
    Range("AH3:AM3").Select
    Selection.AutoFill Destination:=Range("AH3:AM119"), Type:=xlFillDefault
    Range("AH3:AM119").Select
    Selection.AutoFill Destination:=Range("AH3:AM200"), Type:=xlFillDefault
    Range("AH3:AM200").Select
    ActiveWindow.ScrollRow = 174
    ActiveWindow.ScrollRow = 173
    ActiveWindow.ScrollRow = 172
    ActiveWindow.ScrollRow = 171
    ActiveWindow.ScrollRow = 170
    ActiveWindow.ScrollRow = 169
    ActiveWindow.ScrollRow = 168
    ActiveWindow.ScrollRow = 167
    ActiveWindow.ScrollRow = 166
    ActiveWindow.ScrollRow = 165
    ActiveWindow.ScrollRow = 164
    ActiveWindow.ScrollRow = 162
    ActiveWindow.ScrollRow = 161
    ActiveWindow.ScrollRow = 160
    ActiveWindow.ScrollRow = 159
    ActiveWindow.ScrollRow = 157
    ActiveWindow.ScrollRow = 156
    ActiveWindow.ScrollRow = 154
    ActiveWindow.ScrollRow = 153
    ActiveWindow.ScrollRow = 152
    ActiveWindow.ScrollRow = 150
    ActiveWindow.ScrollRow = 149
    ActiveWindow.ScrollRow = 147
    ActiveWindow.ScrollRow = 146
    ActiveWindow.ScrollRow = 145
    ActiveWindow.ScrollRow = 143
    ActiveWindow.ScrollRow = 141
    ActiveWindow.ScrollRow = 139
    ActiveWindow.ScrollRow = 137
    ActiveWindow.ScrollRow = 134
    ActiveWindow.ScrollRow = 131
    ActiveWindow.ScrollRow = 129
    ActiveWindow.ScrollRow = 126
    ActiveWindow.ScrollRow = 123
    ActiveWindow.ScrollRow = 120
    ActiveWindow.ScrollRow = 118
    ActiveWindow.ScrollRow = 115
    ActiveWindow.ScrollRow = 112
    ActiveWindow.ScrollRow = 110
    ActiveWindow.ScrollRow = 108
    ActiveWindow.ScrollRow = 105
    ActiveWindow.ScrollRow = 103
    ActiveWindow.ScrollRow = 101
    ActiveWindow.ScrollRow = 98
    ActiveWindow.ScrollRow = 95
    ActiveWindow.ScrollRow = 92
    ActiveWindow.ScrollRow = 90
    ActiveWindow.ScrollRow = 88
    ActiveWindow.ScrollRow = 85
    ActiveWindow.ScrollRow = 82
    ActiveWindow.ScrollRow = 80
    ActiveWindow.ScrollRow = 77
    ActiveWindow.ScrollRow = 75
    ActiveWindow.ScrollRow = 72
    ActiveWindow.ScrollRow = 70
    ActiveWindow.ScrollRow = 67
    ActiveWindow.ScrollRow = 63
    ActiveWindow.ScrollRow = 61
    ActiveWindow.ScrollRow = 58
    ActiveWindow.ScrollRow = 54
    ActiveWindow.ScrollRow = 52
    ActiveWindow.ScrollRow = 48
    ActiveWindow.ScrollRow = 44
    ActiveWindow.ScrollRow = 41
    ActiveWindow.ScrollRow = 38
    ActiveWindow.ScrollRow = 35
    ActiveWindow.ScrollRow = 32
    ActiveWindow.ScrollRow = 29
    ActiveWindow.ScrollRow = 26
    ActiveWindow.ScrollRow = 24
    ActiveWindow.ScrollRow = 21
    ActiveWindow.ScrollRow = 19
    ActiveWindow.ScrollRow = 17
    ActiveWindow.ScrollRow = 15
    ActiveWindow.ScrollRow = 13
    ActiveWindow.ScrollRow = 12
    ActiveWindow.ScrollRow = 10
    ActiveWindow.ScrollRow = 9
    ActiveWindow.ScrollRow = 7
    ActiveWindow.ScrollRow = 6
    ActiveWindow.ScrollRow = 4
    ActiveWindow.ScrollRow = 3
    ActiveWindow.ScrollRow = 2
    ActiveWindow.ScrollRow = 1
    ActiveWindow.ScrollColumn = 23
    ActiveWindow.ScrollColumn = 22
    ActiveWindow.ScrollColumn = 21
    ActiveWindow.ScrollColumn = 20
    ActiveWindow.ScrollColumn = 19
    ActiveWindow.ScrollColumn = 18
    ActiveWindow.ScrollColumn = 16
    ActiveWindow.ScrollColumn = 15
    ActiveWindow.ScrollColumn = 14
    ActiveWindow.ScrollColumn = 13
    ActiveWindow.ScrollColumn = 12
    ActiveWindow.ScrollColumn = 11
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 5
    ActiveWindow.ScrollColumn = 3
    ActiveWindow.ScrollColumn = 1
    ActiveSheet.Range("$A$4:$R$206").AutoFilter Field:=6, Criteria1:= _
        "no procede"
    Rows("5:200").Select
    Selection.Delete Shift:=xlUp
    ActiveWindow.SmallScroll Down:=-15
    ActiveSheet.Range("$A$4:$S$27").AutoFilter Field:=6
    ActiveWindow.SmallScroll Down:=-33
    Range("C5").Select
    ActiveCell.FormulaR1C1 = "=R[-3]C"
    Range("D2").Select
    ActiveCell.FormulaR1C1 = "=INDEX(R[2]C:R[200]C,COUNTA(R[3]C:R[200]C),1)"
    Range("A3:R3").Select
    ActiveWindow.SmallScroll Down:=-9
    Range("D2").Select
    ActiveCell.FormulaR1C1 = "=INDEX(R[2]C:R[200]C,COUNTA(R[3]C:R[200]C),2)"
    Range("D2").Select
    ActiveCell.FormulaR1C1 = "=INDEX(R[2]C:R[200]C,COUNTA(R[3]C:R[200]C),1)"
    Range("D2").Select
    ActiveCell.FormulaR1C1 = "=INDEX(R[2]C:R[200]C,COUNTA(R[3]C:R[200]C),4)"
    Range("A3:R3").Select
    ActiveWindow.SmallScroll Down:=-6
    Range("D2").Select
    ActiveCell.FormulaR1C1 = "=INDEX(R[2]C:R[200]C,COUNTA(R[3]C:R[200]C),1)"
    Range("D2").Select
    ActiveWindow.SmallScroll Down:=3
    ActiveCell.FormulaR1C1 = _
        "=INDEX(R[2]C[-1]:R[200]C,COUNTA(R[3]C[-1]:R[200]C),1)"
    Range("D2").Select
    ActiveWindow.SmallScroll Down:=-9
    ActiveCell.FormulaR1C1 = "=INDEX(R[2]C:R[200]C,COUNTA(R[3]C:R[200]C),1)"
    Range("D2").Select
    ActiveWindow.SmallScroll Down:=3
    ActiveCell.FormulaR1C1 = "=INDEX(R[2]C:R[200]C,COUNTA(R[3]C:R[200]C),0)"
    Range("D2").Select
    ActiveWindow.SmallScroll Down:=18
    Range("D26").Select
    ActiveWindow.SmallScroll Down:=-39
    Range("D2").Select
    ActiveCell.FormulaR1C1 = "=INDEX(R[3]C:R[200]C,COUNTA(R[3]C:R[200]C),0)"
    Range("D2").Select
    ActiveWindow.SmallScroll Down:=-9
    Range("H2").Select
    Range("A1:B1").Select
End Sub


Sub ValidarFechas()
'
' Validar fechas Macro
'

'
Sheets("Entrada datos").Select
    ActiveWindow.ScrollColumn = 2
    ActiveWindow.ScrollColumn = 3
    ActiveWindow.ScrollColumn = 4
    ActiveWindow.ScrollColumn = 5
    ActiveWindow.ScrollColumn = 6
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 11
    ActiveWindow.ScrollColumn = 12
    ActiveWindow.ScrollColumn = 13
    ActiveWindow.ScrollColumn = 14
    ActiveWindow.ScrollColumn = 15
    ActiveWindow.ScrollColumn = 16
    ActiveWindow.ScrollColumn = 17
    ActiveWindow.ScrollColumn = 18
    ActiveWindow.ScrollColumn = 19
    ActiveWindow.ScrollColumn = 20
    ActiveWindow.ScrollColumn = 21
    ActiveWindow.ScrollColumn = 22
    ActiveWindow.ScrollColumn = 23
    ActiveWindow.ScrollColumn = 24
    Range("AH3").Select
    ActiveCell.FormulaR1C1 = "=SUBTOTAL(5,Valoración!R[2]C[-21])"
    Range("AH3").Select
    Selection.NumberFormat = "0.000"
    Selection.NumberFormat = "0.00"
    Selection.NumberFormat = "0.0"
    Selection.NumberFormat = "0"
    Selection.AutoFill Destination:=Range("AH3:AM3"), Type:=xlFillDefault
    Range("AH3:AM3").Select
    Selection.AutoFill Destination:=Range("AH3:AM119"), Type:=xlFillDefault
    Range("AH3:AM119").Select
    Selection.AutoFill Destination:=Range("AH3:AM200"), Type:=xlFillDefault
    Range("AH3:AM200").Select
    ActiveWindow.ScrollRow = 174
    ActiveWindow.ScrollRow = 173
    ActiveWindow.ScrollRow = 172
    ActiveWindow.ScrollRow = 171
    ActiveWindow.ScrollRow = 170
    ActiveWindow.ScrollRow = 169
    ActiveWindow.ScrollRow = 168
    ActiveWindow.ScrollRow = 167
    ActiveWindow.ScrollRow = 166
    ActiveWindow.ScrollRow = 165
    ActiveWindow.ScrollRow = 164
    ActiveWindow.ScrollRow = 162
    ActiveWindow.ScrollRow = 161
    ActiveWindow.ScrollRow = 160
    ActiveWindow.ScrollRow = 159
    ActiveWindow.ScrollRow = 157
    ActiveWindow.ScrollRow = 156
    ActiveWindow.ScrollRow = 154
    ActiveWindow.ScrollRow = 153
    ActiveWindow.ScrollRow = 152
    ActiveWindow.ScrollRow = 150
    ActiveWindow.ScrollRow = 149
    ActiveWindow.ScrollRow = 147
    ActiveWindow.ScrollRow = 146
    ActiveWindow.ScrollRow = 145
    ActiveWindow.ScrollRow = 143
    ActiveWindow.ScrollRow = 141
    ActiveWindow.ScrollRow = 139
    ActiveWindow.ScrollRow = 137
    ActiveWindow.ScrollRow = 134
    ActiveWindow.ScrollRow = 131
    ActiveWindow.ScrollRow = 129
    ActiveWindow.ScrollRow = 126
    ActiveWindow.ScrollRow = 123
    ActiveWindow.ScrollRow = 120
    ActiveWindow.ScrollRow = 118
    ActiveWindow.ScrollRow = 115
    ActiveWindow.ScrollRow = 112
    ActiveWindow.ScrollRow = 110
    ActiveWindow.ScrollRow = 108
    ActiveWindow.ScrollRow = 105
    ActiveWindow.ScrollRow = 103
    ActiveWindow.ScrollRow = 101
    ActiveWindow.ScrollRow = 98
    ActiveWindow.ScrollRow = 95
    ActiveWindow.ScrollRow = 92
    ActiveWindow.ScrollRow = 90
    ActiveWindow.ScrollRow = 88
    ActiveWindow.ScrollRow = 85
    ActiveWindow.ScrollRow = 82
    ActiveWindow.ScrollRow = 80
    ActiveWindow.ScrollRow = 77
    ActiveWindow.ScrollRow = 75
    ActiveWindow.ScrollRow = 72
    ActiveWindow.ScrollRow = 70
    ActiveWindow.ScrollRow = 67
    ActiveWindow.ScrollRow = 63
    ActiveWindow.ScrollRow = 61
    ActiveWindow.ScrollRow = 58
    ActiveWindow.ScrollRow = 54
    ActiveWindow.ScrollRow = 52
    ActiveWindow.ScrollRow = 48
    ActiveWindow.ScrollRow = 44
    ActiveWindow.ScrollRow = 41
    ActiveWindow.ScrollRow = 38
    ActiveWindow.ScrollRow = 35
    ActiveWindow.ScrollRow = 32
    ActiveWindow.ScrollRow = 29
    ActiveWindow.ScrollRow = 26
    ActiveWindow.ScrollRow = 24
    ActiveWindow.ScrollRow = 21
    ActiveWindow.ScrollRow = 19
    ActiveWindow.ScrollRow = 17
    ActiveWindow.ScrollRow = 15
    ActiveWindow.ScrollRow = 13
    ActiveWindow.ScrollRow = 12
    ActiveWindow.ScrollRow = 10
    ActiveWindow.ScrollRow = 9
    ActiveWindow.ScrollRow = 7
    ActiveWindow.ScrollRow = 6
    ActiveWindow.ScrollRow = 4
    ActiveWindow.ScrollRow = 3
    ActiveWindow.ScrollRow = 2
    ActiveWindow.ScrollRow = 1
    ActiveWindow.ScrollColumn = 23
    ActiveWindow.ScrollColumn = 22
    ActiveWindow.ScrollColumn = 21
    ActiveWindow.ScrollColumn = 20
    ActiveWindow.ScrollColumn = 19
    ActiveWindow.ScrollColumn = 18
    ActiveWindow.ScrollColumn = 16
    ActiveWindow.ScrollColumn = 15
    ActiveWindow.ScrollColumn = 14
    ActiveWindow.ScrollColumn = 13
    ActiveWindow.ScrollColumn = 12
    ActiveWindow.ScrollColumn = 11
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 5
    ActiveWindow.ScrollColumn = 3
    ActiveWindow.ScrollColumn = 1
    ActiveSheet.Range("$A$4:$R$206").AutoFilter Field:=6, Criteria1:= _
        "no procede"
    Rows("5:200").Select
    Selection.Delete Shift:=xlUp
    ActiveWindow.SmallScroll Down:=-15
    ActiveSheet.Range("$A$4:$S$27").AutoFilter Field:=6
    ActiveWindow.SmallScroll Down:=-33
    Range("C5").Select
    ActiveCell.FormulaR1C1 = "=R[-3]C"
    Range("D2").Select
    ActiveCell.FormulaR1C1 = "=INDEX(R[2]C:R[200]C,COUNTA(R[3]C:R[200]C),1)"
    Range("A3:R3").Select
    ActiveWindow.SmallScroll Down:=-9
    Range("D2").Select
    ActiveCell.FormulaR1C1 = "=INDEX(R[2]C:R[200]C,COUNTA(R[3]C:R[200]C),2)"
    Range("D2").Select
    ActiveCell.FormulaR1C1 = "=INDEX(R[2]C:R[200]C,COUNTA(R[3]C:R[200]C),1)"
    Range("D2").Select
    ActiveCell.FormulaR1C1 = "=INDEX(R[2]C:R[200]C,COUNTA(R[3]C:R[200]C),4)"
    Range("A3:R3").Select
    ActiveWindow.SmallScroll Down:=-6
    Range("D2").Select
    ActiveCell.FormulaR1C1 = "=INDEX(R[2]C:R[200]C,COUNTA(R[3]C:R[200]C),1)"
    Range("D2").Select
    ActiveWindow.SmallScroll Down:=3
    ActiveCell.FormulaR1C1 = _
        "=INDEX(R[2]C[-1]:R[200]C,COUNTA(R[3]C[-1]:R[200]C),1)"
    Range("D2").Select
    ActiveWindow.SmallScroll Down:=-9
    ActiveCell.FormulaR1C1 = "=INDEX(R[2]C:R[200]C,COUNTA(R[3]C:R[200]C),1)"
    Range("D2").Select
    ActiveWindow.SmallScroll Down:=3
    ActiveCell.FormulaR1C1 = "=INDEX(R[2]C:R[200]C,COUNTA(R[3]C:R[200]C),0)"
    Range("D2").Select
    ActiveWindow.SmallScroll Down:=18
    Range("D26").Select
    ActiveWindow.SmallScroll Down:=-39
    Range("D2").Select
    ActiveCell.FormulaR1C1 = "=INDEX(R[3]C:R[200]C,COUNTA(R[3]C:R[200]C),0)"
    Range("D2").Select
    ActiveWindow.SmallScroll Down:=-9
    Range("H2").Select
    Range("A1:B1").Select
End Sub

Sub AhoraTipoV()
'
' AhoraTipoV Macro
'
    
    Range("S5").Select
    ActiveCell.FormulaR1C1 = "Tipo V"
    Range("S5").Select
    Selection.AutoFill Destination:=Range("S5:S200")
    Range("S5:S200").Select
    
    Range("A2").Select
    ActiveWorkbook.RefreshAll
End Sub
Sub AhoraTipoVDH()
'
' AhoraTipoVDH Macro
'

'
    Range("S5").Select
    ActiveCell.FormulaR1C1 = "TV DH"
    Range("S5").Select
    Selection.AutoFill Destination:=Range("S5:S200")
    Range("S5:S200").Select
    
    Range("A2").Select
    ActiveWorkbook.RefreshAll
End Sub
Sub AhoraTipoIV()
'
' AhoraTipoIV Macro
'

'
    Range("S5").Select
    ActiveCell.FormulaR1C1 = "Tipo IV"
    Range("S5").Select
    Selection.AutoFill Destination:=Range("S5:S200")

    Range("A2").Select
    ActiveWorkbook.RefreshAll
End Sub


Sub AhoraValorarCMD()
'
' AhoraValorarCMD Macro
'

'
    Range("M5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""Tipo V DH"",(R2C5*R2C6*RC5)*58.33%-RC[-6],IF(RC19=""Tipo IV"",(R2C5*R2C6*RC5)*11.83%-RC[-6],"""")))"
    Range("M5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"",(R[-3]C7*RC5)*58.33%-RC[-6],IF(RC19=""Tipo IV"",(R[-3]C7*RC5)*11.83%-RC[-6],"""")))"
    Range("M5").Select
    Selection.AutoFill Destination:=Range("M5:N5"), Type:=xlFillDefault
    Range("M5:N5").Select
    Range("N5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"",(R[-3]C[-7]*RC5)-RC[-6],IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R[-3]C7*RC5)*35.583%-RC[-6],"""")))"
    Range("N5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"",(R2C7*RC5)-RC[-6],IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R[-3]C7*RC5)*35.583%-RC[-6],"""")))"
    Range("M5").Select
    Selection.AutoFill Destination:=Range("M5:N5"), Type:=xlFillDefault
    Range("M5:N5").Select
    Range("N5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""TV DH"","""",IF(RC19=""Tipo V"",(R[-3]C7*RC5)-RC[-6],IF(RC19=""Tipo IV"",(R[-3]C7*RC5)*35.5%-RC[-6],"""")))"
    Range("E5").Select
    Range("G2").Select
    Range("N5").Select
    Selection.AutoFill Destination:=Range("N5:O5"), Type:=xlFillDefault
    Range("N5:O5").Select
    Range("O5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"",(R[-3]C7*RC5)*41.67%-RC[-6],IF(RC19=""Tipo IV"",(R[-3]C7*RC5)*23.67%-RC[-6],"""")))"
    Range("O5").Select
    Selection.AutoFill Destination:=Range("O5:P5"), Type:=xlFillDefault
    Range("O5:P5").Select
    Range("P5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R[-3]C7*RC5)*4.83%-RC[-6],"""")))"
    Range("P5").Select
    Selection.AutoFill Destination:=Range("P5:R5"), Type:=xlFillDefault
    Range("P5:R5").Select
    Range("Q5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R[-3]C7*RC5)*14.5%-RC[-6],"""")))"
    Range("Q5").Select
    Selection.AutoFill Destination:=Range("Q5:R5"), Type:=xlFillDefault
    Range("Q5:R5").Select
    Range("R5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R[-3]C7*RC5)*9.67%-RC[-6],"""")))"
    Range("M5:R5").Select
    Selection.AutoFill Destination:=Range("M5:R200"), Type:=xlFillDefault
    Range("M5:R200").Select
    ActiveWindow.SmallScroll Down:=-270
    Range("N7").Select
    ActiveWindow.SmallScroll Down:=-21
    Range("N6").Select
    Selection.AutoFill Destination:=Range("N6:N7"), Type:=xlFillDefault
    Range("N6:N7").Select
    Range("N5").Select
    Selection.AutoFill Destination:=Range("N5:N7"), Type:=xlFillDefault
    Range("N5:N7").Select
    Range("M5:R5").Select
    Selection.AutoFill Destination:=Range("M5:R8"), Type:=xlFillDefault
    Range("M5:R8").Select
    Range("N7").Select
    Sheets("Entrada datos").Select
    ActiveWindow.ScrollColumn = 2
    Range("Q5:Q16").Select
    ActiveWindow.SmallScroll Down:=-21
    Range("A1").Select
    Sheets("Valoración").Select
    Range("N5").Select
    ActiveWindow.SmallScroll Down:=-9
    Range("M5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"",(R2C7*RC5)*58.33%-RC[-6],IF(RC19=""Tipo IV"",(R2C7*RC5)*11.83%-RC[-6],"""")))"
    Range("N5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""TV DH"","""",IF(RC19=""Tipo V"",(R2C7*RC5)-RC[-6],IF(RC19=""Tipo IV"",(R2C7*RC5)*35.5%-RC[-6],"""")))"
    Range("O5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"",(R2C7*RC5)*41.67%-RC[-6],IF(RC19=""Tipo IV"",(R2C7*RC5)*23.67%-RC[-6],"""")))"
    Range("P5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R2C7*RC5)*4.83%-RC[-6],"""")))"
    Range("Q5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R2C7*RC5)*14.5%-RC[-6],"""")))"
    Range("R5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R2C7*RC5)*9.67%-RC[-6],"""")))"
    Range("M5:R5").Select
    Selection.AutoFill Destination:=Range("M5:R200")
    Range("M5:R200").Select
    Range("A2").Select
    ActiveWorkbook.RefreshAll
End Sub


Sub AhoraValorarCTE()
'
' AhoraValorarCTE Macro
' Valora por constante restando la energía facturada por ciclo.
'

'
    Range("M5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"",(R2C5*R2C6*RC5)*58.33%-RC[-6],IF(RC19=""Tipo IV"",(R2C5*R2C6*RC5)*11.83%-RC[-6],"""")))"
    Range("M5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"",(R2C8*RC[-6])-RC[-6],IF(RC19=""Tipo IV"",(R2C8*RC[-6])-RC[-6],"""")))"
    Range("M5").Select
    Selection.AutoFill Destination:=Range("M5:N5"), Type:=xlFillDefault
    Range("M5:N5").Select
    Range("N5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""TV DH"","""",IF(RC19=""Tipo V"",(R2C8*RC[-6])-RC[-6],IF(RC19=""Tipo IV"",(R2C8*RC[-6])-RC[-6],"""")))"
    Range("N5").Select
    Selection.AutoFill Destination:=Range("N5:O5"), Type:=xlFillDefault
    Range("N5:O5").Select
    Range("O5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"",(R2C8*RC[-6])-RC[-6],IF(RC19=""Tipo IV"",(R2C8*RC[-6])-RC[-6],"""")))"
    Range("O5").Select
    Selection.AutoFill Destination:=Range("O5:P5"), Type:=xlFillDefault
    Range("O5:P5").Select
    Range("P5").Select
    ActiveCell.FormulaR1C1 = _
        "=IF(RC19=""Tipo V"","""",IF(RC19=""TV DH"","""",IF(RC19=""Tipo IV"",(R2C8*RC[-6])-RC[-6],"""")))"
    Range("P5").Select
    Selection.AutoFill Destination:=Range("P5:R5"), Type:=xlFillDefault
    Range("P5:R5").Select
    Range("M5:R5").Select
    Selection.AutoFill Destination:=Range("M5:R200")
    Range("M5:R200").Select
    Range("A2").Select
    ActiveWorkbook.RefreshAll
End Sub


// Aqui para abajo lo que contiene la macro personal
Sub ComplementarInformacion()
    ' Definir las rutas de los archivos
    Dim rutaArchivo1 As String
    Dim rutaArchivo2 As String
    
    rutaArchivo1 = "Ruta_del_Archivo1.xlsx" ' Actualiza con la ruta correcta del primer archivo
    rutaArchivo2 = "Ruta_del_Archivo2.xlsx" ' Actualiza con la ruta correcta del segundo archivo
    
    ' Abrir los archivos
    Workbooks.Open rutaArchivo1
    Workbooks.Open rutaArchivo2
    
    ' Complementar la información del segundo archivo en el primero
    Dim wb1 As Workbook
    Dim wb2 As Workbook
    Dim ws1 As Worksheet
    Dim ws2 As Worksheet
    Dim lastRow As Long
    Dim i As Long
    
    Set wb1 = ActiveWorkbook ' Archivo1
    Set wb2 = Workbooks(2)   ' Archivo2
    
    Set ws1 = wb1.Sheets(1)  ' Hoja 1 del Archivo1
    Set ws2 = wb2.Sheets(1)  ' Hoja 1 del Archivo2
    
    lastRow = ws1.Cells(ws1.Rows.Count, "A").End(xlUp).Row
    
    For i = 2 To lastRow ' Comienza desde la segunda fila (suponiendo que la primera fila son encabezados)
        Dim buscarValor As Variant
        buscarValor = ws1.Cells(i, "A").Value
        
        Dim complementarValor As Variant
        complementarValor = Application.VLookup(buscarValor, ws2.Range("A:B"), 2, False)
        
        If Not IsError(complementarValor) Then ' Comprueba si se encontró un valor coincidente
            ws1.Cells(i, "B").Value = complementarValor ' Complementa el valor en la columna B del Archivo1
        End If
    Next i
    
    ' Cerrar y guardar los archivos
    wb1.Close SaveChanges:=True
    wb2.Close SaveChanges:=False
    
    MsgBox "La información se ha complementado correctamente."
End Sub


Sub Copia_y_abre_hoja_análisis3()
'
' Copia_y_abre_hoja_análisis3 Macro
' Copia y abre hoja análisis para ejecturar la macro.
'
' Acceso directo: CTRL+y
'
    Cells.Select
    Selection.Copy
    ChDir "C:\AD_Expedientes"
    Workbooks.Open Filename:="C:\ADExpedientes\Análisis de Expedientes.xlsm"
    Range("A1").Select
    ActiveSheet.Paste
    ActiveSheet.Shapes.Range(Array("Rounded Rectangle 10")).Select
    Selection.Delete
    ActiveSheet.Range("$F$1:$F$137").AutoFilter Field:=1, Criteria1:=Array( _
        "ANULADORA(ES PARA FACTURA DE ABONO DE FACTURA TIPO A)", _
        "ANULADORA (ES PARA LA FACTURA DE ABONO SUSTITUIDA TIPO S)", "FRAUDE", "A", "S", _
        "SUSTITUIDA"), Operator:=xlFilterValues
    Application.CutCopyMode = False
    Selection.ClearContents
    Sheets("Comentario").Select
    ActiveWindow.SmallScroll Down:=15
    Rows("50:50").Select
    Selection.Copy
    ActiveWindow.SmallScroll Down:=-69
    Sheets("Entrada datos").Select
    Range("A1").Select
    ActiveSheet.Paste
    Application.CutCopyMode = False
    Selection.AutoFilter
    ActiveWorkbook.Worksheets("Entrada datos").AutoFilter.Sort.SortFields.Clear
    ActiveWorkbook.Worksheets("Entrada datos").AutoFilter.Sort.SortFields.Add Key _
        :=Range("G1"), SortOn:=xlSortOnValues, Order:=xlDescending, DataOption:= _
        xlSortNormal
    Cells.Select
    ActiveWorkbook.Worksheets("Entrada datos").Sort.SortFields.Clear
    ActiveWorkbook.Worksheets("Entrada datos").Sort.SortFields.Add Key:=Range( _
        "G2:G200"), SortOn:=xlSortOnValues, Order:=xlAscending, DataOption:= _
        xlSortNormal
    With ActiveWorkbook.Worksheets("Entrada datos").Sort
        .SetRange Range("A1:AS200")
        .Header = xlYes
        .MatchCase = False
        .Orientation = xlTopToBottom
        .SortMethod = xlPinYin
        .Apply
    End With
    Sheets("Vista por años").Select
    ActiveWorkbook.RefreshAll
End Sub

Sub Copia_y_abre_hoja_análisis3()
'
' Copia_y_abre_hoja_análisis3 Macro
' Copia y abre hoja análisis para ejecturar la macro.
'
' Acceso directo: CTRL+y
'
    Cells.Select
    Selection.Copy
    ChDir "C:\AD_Expedientes"
    Workbooks.Open Filename:="C:\ADExpedientes\Análisis de Expedientes.xlsm"
    Range("A1").Select
    ActiveSheet.Paste
    ActiveSheet.Shapes.Range(Array("Rounded Rectangle 10")).Select
    Selection.Delete
    ActiveSheet.Range("$F$1:$F$137").AutoFilter Field:=1, Criteria1:=Array( _
        "ANULADORA(ES PARA FACTURA DE ABONO DE FACTURA TIPO A)", _
        "ANULADORA (ES PARA LA FACTURA DE ABONO SUSTITUIDA TIPO S)", "FRAUDE", "A", "S", _
        "SUSTITUIDA"), Operator:=xlFilterValues
    Application.CutCopyMode = False
    Selection.ClearContents
    Sheets("Comentario").Select
    ActiveWindow.SmallScroll Down:=15
    Rows("50:50").Select
    Selection.Copy
    ActiveWindow.SmallScroll Down:=-69
    Sheets("Entrada datos").Select
    Range("A1").Select
    ActiveSheet.Paste
    Application.CutCopyMode = False
    Selection.AutoFilter
    ActiveWorkbook.Worksheets("Entrada datos").AutoFilter.Sort.SortFields.Clear
    ActiveWorkbook.Worksheets("Entrada datos").AutoFilter.Sort.SortFields.Add Key _
        :=Range("G1"), SortOn:=xlSortOnValues, Order:=xlDescending, DataOption:= _
        xlSortNormal
    Cells.Select
    ActiveWorkbook.Worksheets("Entrada datos").Sort.SortFields.Clear
    ActiveWorkbook.Worksheets("Entrada datos").Sort.SortFields.Add Key:=Range( _
        "G2:G200"), SortOn:=xlSortOnValues, Order:=xlAscending, DataOption:= _
        xlSortNormal
    With ActiveWorkbook.Worksheets("Entrada datos").Sort
        .SetRange Range("A1:AS200")
        .Header = xlYes
        .MatchCase = False
        .Orientation = xlTopToBottom
        .SortMethod = xlPinYin
        .Apply
    End With
    Sheets("Vista por años").Select
    ActiveWorkbook.RefreshAll
End Sub


Sub Abre_Informe()
'
' Abre_Informe Macro
'

'
    Cells.Select
    Selection.Copy
    ChDir "C:\AD Expedientes"
    Workbooks.Open Filename:= _
        "C:\AD Expedientes\Informe DGE - Definitivo (Prueba).xlsm"
    Cells.Select
    ActiveSheet.Paste
    ActiveWindow.ScrollColumn = 2
    ActiveWindow.ScrollColumn = 3
    ActiveWindow.ScrollColumn = 4
    ActiveWindow.ScrollColumn = 5
    ActiveWindow.ScrollColumn = 6
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 11
    ActiveWindow.ScrollColumn = 12
    ActiveWindow.ScrollColumn = 13
    ActiveWindow.ScrollColumn = 12
    ActiveWindow.ScrollColumn = 11
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 5
    ActiveWindow.ScrollColumn = 4
    ActiveWindow.ScrollColumn = 3
    ActiveWindow.ScrollColumn = 2
    ActiveWindow.ScrollColumn = 1
    Application.CutCopyMode = False
    Selection.AutoFilter
    Selection.AutoFilter
    ActiveWindow.ScrollColumn = 2
    ActiveWindow.ScrollColumn = 3
    ActiveWindow.ScrollColumn = 4
    ActiveWindow.ScrollColumn = 5
    ActiveWindow.ScrollColumn = 6
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 11
    ActiveWindow.ScrollColumn = 12
    ActiveWindow.ScrollColumn = 13
    ActiveWindow.ScrollColumn = 14
    ActiveSheet.Range("$A$1:$AR$200").AutoFilter Field:=27, Criteria1:= _
        "#¡VALOR!"
    Cells.Select
    Range("N1").Activate
    Selection.ClearContents
    ActiveWindow.ScrollColumn = 13
    ActiveWindow.ScrollColumn = 12
    ActiveWindow.ScrollColumn = 11
    ActiveWindow.ScrollColumn = 10
    ActiveWindow.ScrollColumn = 9
    ActiveWindow.ScrollColumn = 8
    ActiveWindow.ScrollColumn = 7
    ActiveWindow.ScrollColumn = 6
    ActiveWindow.ScrollColumn = 5
    ActiveWindow.ScrollColumn = 4
    ActiveWindow.ScrollColumn = 3
    ActiveWindow.ScrollColumn = 2
    ActiveWindow.ScrollColumn = 1
    Sheets("Vista por años").Select
    ActiveWindow.ScrollRow = 24
    ActiveWindow.ScrollRow = 25
    ActiveWindow.ScrollRow = 26
    ActiveWindow.ScrollRow = 27
    ActiveWindow.ScrollRow = 30
    ActiveWindow.ScrollRow = 31
    ActiveWindow.ScrollRow = 32
    ActiveWindow.ScrollRow = 33
    ActiveWindow.ScrollRow = 34
    ActiveWindow.ScrollRow = 35
    ActiveWindow.ScrollRow = 37
    ActiveWindow.ScrollRow = 38
    ActiveWindow.ScrollRow = 39
    ActiveWindow.ScrollRow = 40
    ActiveWindow.ScrollRow = 45
    ActiveWindow.ScrollRow = 46
    ActiveWindow.ScrollRow = 58
    ActiveWindow.ScrollRow = 60
    ActiveWindow.ScrollRow = 62
    ActiveWindow.ScrollRow = 77
    ActiveWindow.ScrollRow = 79
    ActiveWindow.ScrollRow = 80
    ActiveWindow.ScrollRow = 91
    ActiveWindow.ScrollRow = 92
    ActiveWindow.ScrollRow = 93
    ActiveWindow.ScrollRow = 105
    ActiveWindow.ScrollRow = 107
    ActiveWindow.ScrollRow = 108
    ActiveWindow.ScrollRow = 119
    ActiveWindow.ScrollRow = 120
    ActiveWindow.ScrollRow = 121
    ActiveWindow.ScrollRow = 127
    ActiveWindow.ScrollRow = 128
    ActiveWindow.ScrollRow = 129
    ActiveWindow.ScrollRow = 140
    ActiveWindow.ScrollRow = 141
    ActiveWindow.ScrollRow = 142
    ActiveWindow.ScrollRow = 154
    ActiveWindow.ScrollRow = 155
    ActiveWindow.ScrollRow = 156
    ActiveWindow.ScrollRow = 166
    ActiveWindow.ScrollRow = 167
    ActiveWindow.ScrollRow = 168
    ActiveWindow.ScrollRow = 173
    ActiveWindow.ScrollRow = 174
    ActiveWindow.ScrollRow = 175
    ActiveWindow.ScrollRow = 181
    ActiveWindow.ScrollRow = 182
    ActiveWindow.ScrollRow = 183
    ActiveWindow.ScrollRow = 189
    ActiveWindow.ScrollRow = 190
    ActiveWindow.ScrollRow = 191
    ActiveWindow.ScrollRow = 196
    ActiveWindow.ScrollRow = 197
    ActiveWindow.ScrollRow = 198
    ActiveWindow.ScrollRow = 203
    ActiveWindow.ScrollRow = 204
    ActiveWindow.ScrollRow = 205
    ActiveWindow.ScrollRow = 213
    ActiveWindow.ScrollRow = 214
    ActiveWindow.ScrollRow = 215
    ActiveWindow.ScrollRow = 225
    ActiveWindow.ScrollRow = 226
    ActiveWindow.ScrollRow = 227
    ActiveWindow.ScrollRow = 239
    ActiveWindow.ScrollRow = 241
    ActiveWindow.ScrollRow = 242
    ActiveWindow.ScrollRow = 249
    ActiveWindow.ScrollRow = 250
    ActiveWindow.ScrollRow = 251
    ActiveWindow.ScrollRow = 252
    ActiveWindow.ScrollRow = 253
    ActiveWindow.ScrollRow = 254
    ActiveWindow.ScrollRow = 259
    ActiveWindow.ScrollRow = 261
    ActiveWindow.ScrollRow = 262
    ActiveWindow.ScrollRow = 266
    ActiveWindow.ScrollRow = 267
    ActiveWindow.ScrollRow = 268
    ActiveWindow.ScrollRow = 271
    ActiveWindow.ScrollRow = 272
    ActiveWindow.ScrollRow = 273
    ActiveWindow.ScrollRow = 275
    ActiveWindow.ScrollRow = 276
    ActiveWindow.ScrollRow = 277
    ActiveWindow.ScrollRow = 281
    ActiveWindow.ScrollRow = 282
    ActiveWindow.ScrollRow = 283
    ActiveWindow.ScrollRow = 285
    ActiveWindow.ScrollRow = 286
    ActiveWindow.ScrollRow = 287
    ActiveWindow.ScrollRow = 290
    ActiveWindow.ScrollRow = 291
    ActiveWindow.ScrollRow = 292
    ActiveWindow.ScrollRow = 293
    ActiveWindow.ScrollRow = 294
    ActiveWindow.ScrollRow = 295
    ActiveWindow.ScrollRow = 297
    ActiveWindow.ScrollRow = 298
    ActiveWindow.ScrollRow = 299
    ActiveWindow.ScrollRow = 300
    Rows("300:300").Select
    Selection.Copy
    Sheets("Entrada datos").Select
    ActiveWindow.SmallScroll Down:=-12
    Range("A1").Select
    ActiveSheet.Paste
    Sheets("Vista por años").Select
    ActiveWindow.SmallScroll Down:=-309
    Sheets("Entrada datos").Select
    Cells.Select
    Application.CutCopyMode = False
    Selection.AutoFilter
    ActiveWorkbook.Worksheets("Entrada datos").AutoFilter.Sort.SortFields.Clear
    ActiveWorkbook.Worksheets("Entrada datos").AutoFilter.Sort.SortFields.Add Key _
        :=Range("L1:L200"), SortOn:=xlSortOnValues, Order:=xlAscending, DataOption _
        :=xlSortTextAsNumbers
    With ActiveWorkbook.Worksheets("Entrada datos").AutoFilter.Sort
        .Header = xlYes
        .MatchCase = False
        .Orientation = xlTopToBottom
        .SortMethod = xlPinYin
        .Apply
            Cells.Select
    Selection.AutoFilter
    ActiveSheet.Range("$A$1:$AR$200").AutoFilter Field:=19, Criteria1:="-"
    Rows("3:200").Select
    Selection.ClearContents
    ActiveSheet.Range("$A$1:$AR$200").AutoFilter Field:=19
    ActiveWindow.SmallScroll Down:=-6
    End With
    Sheets("Vista por años").Select
    ActiveWorkbook.RefreshAll
End Sub


Sub Copia_y_abre_hoja_Análisis()
'
' Macro2 Macro
' Prova 2
'

'
    Cells.Select
    Selection.Copy
    Workbooks.Open Filename:= _
    "C:\AD Expedientes\Análisis de Expedientes.xlsm"
    ActiveSheet.Paste
    ActiveSheet.Range("$F$1:$F$200").AutoFilter Field:=1, Criteria1:="S"
    Application.CutCopyMode = False
    Selection.ClearContents
    ActiveSheet.Range("$E$1:$E$200").AutoFilter Field:=1, Criteria1:="FRAUDE"
    Application.CutCopyMode = False
    Selection.ClearContents
    Sheets("Vista por años").Select
    ActiveWorkbook.RefreshAll
    Sheets("Entrada datos").Select
    ActiveSheet.Shapes.Range(Array("Rounded Rectangle 10")).Select
    Selection.Delete
    Rows("2:200").Select
    ActiveWorkbook.Worksheets("Entrada datos").Sort.SortFields.Clear
    ActiveWorkbook.Worksheets("Entrada datos").Sort.SortFields.Add Key:=Range( _
        "G3:G151"), SortOn:=xlSortOnValues, Order:=xlAscending, DataOption:= _
        xlSortNormal
    With ActiveWorkbook.Worksheets("Entrada datos").Sort
        .SetRange Range("A2:AS151")
        .Header = xlYes
        .MatchCase = False
        .Orientation = xlTopToBottom
        .SortMethod = xlPinYin
        .Apply
    End With
    Sheets("Vista por años").Select
End Sub

