'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Calendar, Clock } from 'lucide-react'

interface AlertaEmocional {
  id: string
  tipo: 'warning' | 'danger' | 'info' | 'success'
  titulo: string
  mensagem: string
  timestamp: Date
  acao?: string
}

interface MetricaEmocional {
  nome: string
  valor: number
  meta: number
  tendencia: 'up' | 'down' | 'stable'
  cor: string
  icon: any
}

const metricas: MetricaEmocional[] = [
  {
    nome: 'Bem-estar Geral',
    valor: 7.2,
    meta: 8.0,
    tendencia: 'up',
    cor: 'bg-green-500',
    icon: CheckCircle
  },
  {
    nome: 'Nível de Estresse',
    valor: 4.1,
    meta: 3.0,
    tendencia: 'down',
    cor: 'bg-orange-500',
    icon: AlertTriangle
  },
  {
    nome: 'Qualidade do Sono',
    valor: 6.8,
    meta: 8.0,
    tendencia: 'up',
    cor: 'bg-blue-500',
    icon: Clock
  },
  {
    nome: 'Energia Diária',
    valor: 7.5,
    meta: 8.0,
    tendencia: 'stable',
    cor: 'bg-purple-500',
    icon: TrendingUp
  }
]

export default function MonitorEmocional() {
  const [alertas, setAlertas] = useState<AlertaEmocional[]>([
    {
      id: '1',
      tipo: 'warning',
      titulo: 'Padrão de Ansiedade Detectado',
      mensagem: 'Você registrou níveis elevados de ansiedade nos últimos 3 dias. Que tal uma pausa para relaxar?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      acao: 'Ver exercícios de respiração'
    },
    {
      id: '2',
      tipo: 'info',
      titulo: 'Lembrete: Registro Diário',
      mensagem: 'Você ainda não fez seu registro emocional de hoje. Que tal dedicar alguns minutos?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
      acao: 'Fazer registro agora'
    },
    {
      id: '3',
      tipo: 'success',
      titulo: 'Progresso Positivo!',
      mensagem: 'Seu humor médio melhorou 15% esta semana. Continue assim!',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
    }
  ])

  const [lembretes, setLembretes] = useState({
    registroDiario: true,
    meditacao: false,
    exercicio: true,
    sono: false
  })

  const formatarTempo = (timestamp: Date) => {
    const agora = new Date()
    const diff = agora.getTime() - timestamp.getTime()
    const minutos = Math.floor(diff / 60000)
    const horas = Math.floor(minutos / 60)
    const dias = Math.floor(horas / 24)

    if (dias > 0) return `${dias}d atrás`
    if (horas > 0) return `${horas}h atrás`
    if (minutos > 0) return `${minutos}min atrás`
    return 'Agora mesmo'
  }

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'danger': return <AlertTriangle className="w-4 h-4" />
      case 'success': return <CheckCircle className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getAlertColor = (tipo: string) => {
    switch (tipo) {
      case 'warning': return 'border-orange-200 bg-orange-50'
      case 'danger': return 'border-red-200 bg-red-50'
      case 'success': return 'border-green-200 bg-green-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  const dismissAlert = (id: string) => {
    setAlertas(alertas.filter(a => a.id !== id))
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitor Emocional</h2>
          <p className="text-muted-foreground">
            Acompanhamento em tempo real do seu bem-estar
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Monitoramento Ativo
        </Badge>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((metrica) => {
          const IconComponent = metrica.icon
          const porcentagem = (metrica.valor / 10) * 100
          const metaProgress = (metrica.meta / 10) * 100
          
          return (
            <Card key={metrica.nome}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    {metrica.nome}
                  </span>
                  {metrica.tendencia === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {metrica.tendencia === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  {metrica.tendencia === 'stable' && <div className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{metrica.valor}</span>
                    <span className="text-sm text-muted-foreground">/ 10</span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={porcentagem} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Atual</span>
                      <span>Meta: {metrica.meta}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Alertas e Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alertas e Notificações
          </CardTitle>
          <CardDescription>
            Insights e lembretes baseados em seus padrões emocionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>Tudo em ordem! Nenhum alerta no momento.</p>
              </div>
            ) : (
              alertas.map((alerta) => (
                <Alert key={alerta.id} className={getAlertColor(alerta.tipo)}>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      {getAlertIcon(alerta.tipo)}
                      <div className="flex-1">
                        <h4 className="font-medium">{alerta.titulo}</h4>
                        <AlertDescription className="mt-1">
                          {alerta.mensagem}
                        </AlertDescription>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs text-muted-foreground">
                            {formatarTempo(alerta.timestamp)}
                          </span>
                          {alerta.acao && (
                            <Button size="sm" variant="outline" className="h-7">
                              {alerta.acao}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAlert(alerta.id)}
                      className="h-7 w-7 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lembretes Personalizados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Lembretes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="font-medium">Registro Diário</span>
                </div>
                <Badge variant={lembretes.registroDiario ? "default" : "secondary"}>
                  {lembretes.registroDiario ? "Ativo" : "Pausado"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="font-medium">Meditação</span>
                </div>
                <Badge variant={lembretes.meditacao ? "default" : "secondary"}>
                  {lembretes.meditacao ? "Ativo" : "Pausado"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="font-medium">Exercício</span>
                </div>
                <Badge variant={lembretes.exercicio ? "default" : "secondary"}>
                  {lembretes.exercicio ? "Ativo" : "Pausado"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <span className="font-medium">Horário do Sono</span>
                </div>
                <Badge variant={lembretes.sono ? "default" : "secondary"}>
                  {lembretes.sono ? "Ativo" : "Pausado"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Ações Sugeridas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50 rounded-r-lg">
                <h4 className="font-medium text-blue-800">Registro Emocional</h4>
                <p className="text-sm text-blue-600 mt-1">
                  Faça seu registro diário para manter o monitoramento preciso
                </p>
                <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                  Registrar Agora
                </Button>
              </div>
              
              <div className="p-3 border-l-4 border-l-green-500 bg-green-50 rounded-r-lg">
                <h4 className="font-medium text-green-800">Exercício de Respiração</h4>
                <p className="text-sm text-green-600 mt-1">
                  5 minutos de respiração podem reduzir a ansiedade
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  Começar
                </Button>
              </div>
              
              <div className="p-3 border-l-4 border-l-purple-500 bg-purple-50 rounded-r-lg">
                <h4 className="font-medium text-purple-800">Revisar Padrões</h4>
                <p className="text-sm text-purple-600 mt-1">
                  Analise seus dados da semana no dashboard
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  Ver Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}