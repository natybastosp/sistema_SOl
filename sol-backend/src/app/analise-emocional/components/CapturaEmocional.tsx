'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Heart, Brain, Zap, Moon, Sun, Cloud, CloudRain, Smile, Meh, Frown } from 'lucide-react'

const emocoes = [
  { nome: 'Feliz', cor: 'bg-yellow-500', icon: Smile },
  { nome: 'Triste', cor: 'bg-blue-500', icon: Frown },
  { nome: 'Ansioso', cor: 'bg-orange-500', icon: Zap },
  { nome: 'Calmo', cor: 'bg-green-500', icon: Heart },
  { nome: 'Irritado', cor: 'bg-red-500', icon: CloudRain },
  { nome: 'Neutro', cor: 'bg-gray-500', icon: Meh },
  { nome: 'Animado', cor: 'bg-purple-500', icon: Sun },
  { nome: 'Cansado', cor: 'bg-indigo-500', icon: Moon }
]

const gatilhos = [
  'Trabalho', 'Relacionamentos', 'Saúde', 'Família', 'Financeiro', 
  'Estudos', 'Social', 'Pessoal', 'Sono', 'Exercício'
]

export default function CapturaEmocional() {
  const [emocaoSelecionada, setEmocaoSelecionada] = useState<string>('')
  const [intensidade, setIntensidade] = useState([5])
  const [gatilhosSelecionados, setGatilhosSelecionados] = useState<string[]>([])
  const [observacoes, setObservacoes] = useState('')
  const [salvo, setSalvo] = useState(false)

  const toggleEmocao = (emocao: string) => {
    setEmocaoSelecionada(emocaoSelecionada === emocao ? '' : emocao)
  }

  const toggleGatilho = (gatilho: string) => {
    setGatilhosSelecionados(prev => 
      prev.includes(gatilho) 
        ? prev.filter(g => g !== gatilho)
        : [...prev, gatilho]
    )
  }

  const salvarEstado = () => {
    const registro = {
      emocao: emocaoSelecionada,
      intensidade: intensidade[0],
      gatilhos: gatilhosSelecionados,
      observacoes,
      timestamp: new Date().toISOString()
    }
    
    console.log('Estado emocional registrado:', registro)
    setSalvo(true)
    
    // Reset após 2 segundos
    setTimeout(() => {
      setSalvo(false)
      setEmocaoSelecionada('')
      setIntensidade([5])
      setGatilhosSelecionados([])
      setObservacoes('')
    }, 2000)
  }

  if (salvo) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-600 mb-2">
            Estado Emocional Registrado!
          </h3>
          <p className="text-muted-foreground text-center">
            Obrigado por compartilhar como você está se sentindo neste momento
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Seleção de Emoção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Como você está se sentindo agora?
          </CardTitle>
          <CardDescription>
            Escolha a emoção que melhor descreve seu estado atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {emocoes.map((emocao) => {
              const IconComponent = emocao.icon
              return (
                <Button
                  key={emocao.nome}
                  variant={emocaoSelecionada === emocao.nome ? "default" : "outline"}
                  className={`h-20 flex flex-col gap-2 ${
                    emocaoSelecionada === emocao.nome ? emocao.cor : ''
                  }`}
                  onClick={() => toggleEmocao(emocao.nome)}
                >
                  <IconComponent className="w-6 h-6" />
                  <span className="text-xs">{emocao.nome}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Intensidade */}
      {emocaoSelecionada && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Intensidade
            </CardTitle>
            <CardDescription>
              Qual a intensidade dessa emoção? (1 = Muito fraca, 10 = Muito intensa)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="px-4">
              <Slider
                value={intensidade}
                onValueChange={setIntensidade}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Muito fraca</span>
              <span className="font-medium text-lg">{intensidade[0]}</span>
              <span>Muito intensa</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gatilhos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Possíveis gatilhos
          </CardTitle>
          <CardDescription>
            O que pode ter influenciado esse sentimento? (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {gatilhos.map((gatilho) => (
              <Badge
                key={gatilho}
                variant={gatilhosSelecionados.includes(gatilho) ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary/20"
                onClick={() => toggleGatilho(gatilho)}
              >
                {gatilho}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações pessoais</CardTitle>
          <CardDescription>
            Adicione qualquer contexto ou reflexão sobre este momento (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: Tive uma reunião difícil hoje, mas consegui resolver bem a situação..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={salvarEstado} 
            className="w-full"
            disabled={!emocaoSelecionada}
          >
            Registrar Estado Emocional
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}