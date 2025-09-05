'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

interface Pergunta {
  id: string
  texto: string
  opcoes: { valor: number; texto: string }[]
}

const perguntas: Pergunta[] = [
  {
    id: 'humor',
    texto: 'Como você se sente hoje?',
    opcoes: [
      { valor: 1, texto: 'Muito triste' },
      { valor: 2, texto: 'Triste' },
      { valor: 3, texto: 'Neutro' },
      { valor: 4, texto: 'Feliz' },
      { valor: 5, texto: 'Muito feliz' }
    ]
  },
  {
    id: 'ansiedade',
    texto: 'Nível de ansiedade atual:',
    opcoes: [
      { valor: 1, texto: 'Muito baixa' },
      { valor: 2, texto: 'Baixa' },
      { valor: 3, texto: 'Moderada' },
      { valor: 4, texto: 'Alta' },
      { valor: 5, texto: 'Muito alta' }
    ]
  },
  {
    id: 'energia',
    texto: 'Como está seu nível de energia?',
    opcoes: [
      { valor: 1, texto: 'Sem energia' },
      { valor: 2, texto: 'Pouca energia' },
      { valor: 3, texto: 'Energia moderada' },
      { valor: 4, texto: 'Boa energia' },
      { valor: 5, texto: 'Muita energia' }
    ]
  },
  {
    id: 'sono',
    texto: 'Como foi sua qualidade de sono?',
    opcoes: [
      { valor: 1, texto: 'Muito ruim' },
      { valor: 2, texto: 'Ruim' },
      { valor: 3, texto: 'Regular' },
      { valor: 4, texto: 'Boa' },
      { valor: 5, texto: 'Excelente' }
    ]
  }
]

export default function QuestionarioEmocional() {
  const [perguntaAtual, setPerguntaAtual] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, number>>({})
  const [finalizado, setFinalizado] = useState(false)

  const handleResposta = (valor: string) => {
    const pergunta = perguntas[perguntaAtual]
    setRespostas(prev => ({
      ...prev,
      [pergunta.id]: parseInt(valor)
    }))
  }

  const proximaPergunta = () => {
    if (perguntaAtual < perguntas.length - 1) {
      setPerguntaAtual(perguntaAtual + 1)
    } else {
      finalizarQuestionario()
    }
  }

  const perguntaAnterior = () => {
    if (perguntaAtual > 0) {
      setPerguntaAtual(perguntaAtual - 1)
    }
  }

  const finalizarQuestionario = () => {
    setFinalizado(true)
    // Aqui você salvaria as respostas no banco de dados
    console.log('Respostas:', respostas)
  }

  const reiniciarQuestionario = () => {
    setPerguntaAtual(0)
    setRespostas({})
    setFinalizado(false)
  }

  if (finalizado) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-green-600">Questionário Concluído!</CardTitle>
          <CardDescription>
            Obrigado por compartilhar como você está se sentindo
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Suas respostas foram registradas e nos ajudarão a acompanhar seu bem-estar
          </p>
          <Button onClick={reiniciarQuestionario} variant="outline">
            Fazer Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  const pergunta = perguntas[perguntaAtual]
  const progresso = ((perguntaAtual + 1) / perguntas.length) * 100
  const respostaAtual = respostas[pergunta.id]?.toString()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Questionário Emocional</CardTitle>
          <span className="text-sm text-muted-foreground">
            {perguntaAtual + 1} de {perguntas.length}
          </span>
        </div>
        <Progress value={progresso} className="mb-4" />
        <CardDescription className="text-lg font-medium">
          {pergunta.texto}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <RadioGroup value={respostaAtual} onValueChange={handleResposta}>
          {pergunta.opcoes.map((opcao) => (
            <div key={opcao.valor} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
              <RadioGroupItem value={opcao.valor.toString()} id={opcao.valor.toString()} />
              <Label 
                htmlFor={opcao.valor.toString()} 
                className="cursor-pointer flex-1 text-sm"
              >
                {opcao.texto}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={perguntaAnterior}
          disabled={perguntaAtual === 0}
        >
          Anterior
        </Button>
        
        <Button 
          onClick={proximaPergunta}
          disabled={!respostaAtual}
        >
          {perguntaAtual === perguntas.length - 1 ? 'Finalizar' : 'Próxima'}
        </Button>
      </CardFooter>
    </Card>
  )
}