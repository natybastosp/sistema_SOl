'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Heart, Brain, Calendar, Activity } from 'lucide-react'

// Dados mockados - em produção viriam do banco de dados
const dadosSemanais = [
  { dia: 'Seg', humor: 6, ansiedade: 4, energia: 7, sono: 8 },
  { dia: 'Ter', humor: 7, ansiedade: 3, energia: 8, sono: 7 },
  { dia: 'Qua', humor: 5, ansiedade: 6, energia: 5, sono: 6 },
  { dia: 'Qui', humor: 8, ansiedade: 2, energia: 9, sono: 8 },
  { dia: 'Sex', humor: 9, ansiedade: 2, energia: 8, sono: 7 },
  { dia: 'Sab', humor: 8, ansiedade: 3, energia: 6, sono: 9 },
  { dia: 'Dom', humor: 7, ansiedade: 4, energia: 7, sono: 8 }
]

const emocoesFrequentes = [
  { nome: 'Feliz', count: 15, cor: '#22c55e' },
  { nome: 'Ansioso', count: 8, cor: '#f97316' },
  { nome: 'Calmo', count: 12, cor: '#3b82f6' },
  { nome: 'Cansado', count: 6, cor: '#6366f1' },
  { nome: 'Animado', count: 9, cor: '#a855f7' }
]

const gatilhosFrequentes = [
  { nome: 'Trabalho', frequencia: 45 },
  { nome: 'Relacionamentos', frequencia: 32 },
  { nome: 'Saúde', frequencia: 28 },
  { nome: 'Financeiro', frequencia: 24 },
  { nome: 'Estudos', frequencia: 18 }
]

const registrosRecentes = [
  {
    id: 1,
    emocao: 'Feliz',
    intensidade: 8,
    data: '2024-01-15',
    hora: '14:30',
    gatilhos: ['Trabalho', 'Social']
  },
  {
    id: 2,
    emocao: 'Ansioso',
    intensidade: 6,
    data: '2024-01-15',
    hora: '09:15',
    gatilhos: ['Trabalho']
  },
  {
    id: 3,
    emocao: 'Calmo',
    intensidade: 7,
    data: '2024-01-14',
    hora: '19:45',
    gatilhos: ['Pessoal', 'Exercício']
  }
]

export default function DashboardEmocional() {
  const [periodo, setPeriodo] = useState('semana')
  
  const calcularMedia = (campo: string) => {
    const soma = dadosSemanais.reduce((acc, dia) => acc + dia[campo as keyof typeof dia], 0)
    return (soma / dadosSemanais.length).toFixed(1)
  }

  const calcularTendencia = (campo: string) => {
    const dados = dadosSemanais.map(d => d[campo as keyof typeof d])
    const primeira = dados.slice(0, 3).reduce((a, b) => a + b) / 3
    const ultima = dados.slice(-3).reduce((a, b) => a + b) / 3
    return ultima > primeira
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Emocional</h1>
          <p className="text-muted-foreground">
            Acompanhe seus padrões emocionais e bem-estar
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={periodo === 'semana' ? 'default' : 'outline'}
            onClick={() => setPeriodo('semana')}
            size="sm"
          >
            Semana
          </Button>
          <Button
            variant={periodo === 'mes' ? 'default' : 'outline'}
            onClick={() => setPeriodo('mes')}
            size="sm"
          >
            Mês
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              Humor Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{calcularMedia('humor')}</span>
              {calcularTendencia('humor') ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">nos últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4 text-orange-500" />
              Ansiedade Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{calcularMedia('ansiedade')}</span>
              {!calcularTendencia('ansiedade') ? (
                <TrendingDown className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">nos últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Energia Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{calcularMedia('energia')}</span>
              {calcularTendencia('energia') ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">nos últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              Registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{registrosRecentes.length}</span>
              <Badge variant="secondary" className="text-xs">Esta semana</Badge>
            </div>
            <p className="text-xs text-muted-foreground">estados registrados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tendencias" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tendencias">Tendências</TabsTrigger>
          <TabsTrigger value="emocoes">Emoções</TabsTrigger>
          <TabsTrigger value="gatilhos">Gatilhos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="tendencias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Semanal</CardTitle>
              <CardDescription>
                Acompanhe como seus indicadores emocionais evoluíram ao longo da semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosSemanais}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="humor" stroke="#22c55e" strokeWidth={2} name="Humor" />
                  <Line type="monotone" dataKey="ansiedade" stroke="#f97316" strokeWidth={2} name="Ansiedade" />
                  <Line type="monotone" dataKey="energia" stroke="#3b82f6" strokeWidth={2} name="Energia" />
                  <Line type="monotone" dataKey="sono" stroke="#6366f1" strokeWidth={2} name="Sono" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emocoes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Emoções Mais Frequentes</CardTitle>
                <CardDescription>Distribuição das suas emoções registradas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={emocoesFrequentes}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ nome, count }) => `${nome}: ${count}`}
                    >
                      {emocoesFrequentes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo das Emoções</CardTitle>
                <CardDescription>Frequência de cada emoção registrada</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emocoesFrequentes.map((emocao) => (
                    <div key={emocao.nome} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: emocao.cor }}
                        />
                        <span className="text-sm font-medium">{emocao.nome}</span>
                      </div>
                      <Badge variant="secondary">{emocao.count}x</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gatilhos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gatilhos Mais Comuns</CardTitle>
              <CardDescription>
                Fatores que mais influenciam seus estados emocionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gatilhosFrequentes} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nome" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="frequencia" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registros Recentes</CardTitle>
              <CardDescription>Seus últimos estados emocionais registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {registrosRecentes.map((registro) => (
                  <div key={registro.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold">{registro.intensidade}</div>
                        <div className="text-xs text-muted-foreground">intensidade</div>
                      </div>
                      <div>
                        <div className="font-medium">{registro.emocao}</div>
                        <div className="text-sm text-muted-foreground">
                          {registro.data} às {registro.hora}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {registro.gatilhos.map((gatilho) => (
                        <Badge key={gatilho} variant="outline" className="text-xs">
                          {gatilho}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}