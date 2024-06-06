describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  context('Hitting the real API', () => {
    beforeEach(() => {
      // cy.intercept('GET', '**/search?query=React&page=0').as('getStories')
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '0'
        }
      }).as('getStories')

      cy.visit('/')
      cy.wait('@getStories')
    })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '1'
        }
      }).as('getNextStories')

      cy.get('.item').should('have.length', 20)

      cy.contains('More').should('be.visible').click()
      cy.wait('@getNextStories')

      cy.get('.item').should('have.length', 40)
    })

    it('searches via the last searched term', () => {
      cy.intercept('GET', `**/search?query=${newTerm}&page=0`).as('getNewTermStories')

      cy.get('#search')
        .should('be.visible')
        .clear()
        .type(`${newTerm}{enter}`)

      cy.wait('@getNewTermStories')

      cy.getLocalStorage('search')
        .should('be.equal', newTerm)

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()

      cy.wait('@getStories')

      cy.getLocalStorage('search')
        .should('be.equal', initialTerm)

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', initialTerm)
      cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })
  })

  context('Mocking the API', () => {
    context('Footer and list of stories', () => {
      beforeEach(() => {
        // cy.intercept('GET', '**/search?query=React&page=0').as('getStories')
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          { fixture: 'stories' }
        ).as('getStories')

        cy.visit('/')
        cy.wait('@getStories')
      })

      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      context('List of stories', () => {
        const stories = require('../fixtures/stories')

        it('shows the right data for all rendered stories', () => {
          cy.get('.item')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[0].title)
            .and('contain', stories.hits[0].author)
            .and('contain', stories.hits[0].num_comments)
            .and('contain', stories.hits[0].points)
          cy.get(`.item a:contains(${stories.hits[0].title})`)
            .should('have.attr', 'href', stories.hits[0].url)

          cy.get('.item')
            .last()
            .should('be.visible')
            .and('contain', stories.hits[1].title)
            .and('contain', stories.hits[1].author)
            .and('contain', stories.hits[1].num_comments)
            .and('contain', stories.hits[1].points)
          cy.get(`.item a:contains(${stories.hits[1].title})`)
            .should('have.attr', 'href', stories.hits[1].url)
        })

        it('shows one less story after dimissing the first one', () => {
          cy.get('.button-small')
            .first()
            .should('be.visible')
            .click()

          cy.get('.item').should('have.length', 1)
        })

        context('Order by', () => {
          it('orders by title', () => {
            cy.contains('Title')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].title)

            cy.contains('Title').click() // n precisar colocar o should be visible aqui, pois ja verificou acima que ele está visível.

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].title)
          })

          it('orders by author', () => {
            cy.contains('Author')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].author)

            cy.contains('Author').click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].author)
          })

          it('orders by comments', () => {
            cy.contains('Comments')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].num_comments)

            cy.contains('Comments').click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].num_comments)
          })

          it('orders by points', () => {
            cy.contains('Points')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].points)

            cy.contains('Points').click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].points)
          })
        })
      })
    })
  })

  context('Search', () => {
    beforeEach(() => {
      cy.intercept(
        'GET',
          `**/search?query=${initialTerm}&page=0`,
          { fixture: 'empty' }
      ).as('getEmptyStories')

      cy.intercept(
        'GET',
          `**/search?query=${newTerm}&page=0`,
          { fixture: 'stories' }
      ).as('getStories')

      cy.visit('/')
      cy.wait('@getEmptyStories')

      cy.get('#search')
        .should('be.visible')
        .clear()
    })

    it('shows no story when none is returned', () => {
      cy.get('.item').should('not.exist')
    })

    it('types and hits ENTER', () => {
      cy.get('#search')
        .should('be.visible')
        .type(`${newTerm}{enter}`)

      cy.wait('@getStories')

      cy.getLocalStorage('search')
        .should('be.equal', newTerm)

      cy.get('.item').should('have.length', 2)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    })

    it('types and clicks the submit button', () => {
      cy.get('#search')
        .should('be.visible')
        .type(newTerm)
      cy.contains('Submit')
        .should('be.visible')
        .click()

      cy.wait('@getStories')

      cy.getLocalStorage('search')
        .should('be.equal', newTerm)

      cy.get('.item').should('have.length', 2)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    })

    context('Last searches', () => {
      it('shows a max of 5 buttons for the last searched terms', () => {
        const faker = require('faker')

        cy.intercept(
          'GET',
          '**/search**', // por ser palavras aleatorias, colocou **' depois do search, por nao saber quais sao as palavras
          { fixture: 'empty' }
        ).as('getRandomStories')

        Cypress._.times(6, () => {
          const randomWord = faker.random.word()
          cy.get('#search') // Aqui n precisa ter o should be visible, pois ja foi verificado que ele ta visível no beforeEach
            .clear()
            .type(`${randomWord}{enter}`)
          cy.wait('@getRandomStories')
          cy.getLocalStorage('search')
            .should('be.equal', randomWord)
        })
        // Selecionando elementos de forma mais específica:
        cy.get('.last-searches')
          .within(() => {
            cy.get('button')
              .should('have.length', 5)
          })
          // Neste exemplo, primeiro escopo minha seleção de elementos ao elemento com a classe last-searches, e então, faço um cy.get por todos os botões filhos deste elemento pai, dentro a função de callback da função .within().
      })
    })
  })
})

context('Errors', () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { statusCode: 500 } // passando um objeto
    ).as('getServerFailure')
    cy.visit('/')
    cy.wait('@getServerFailure')
    cy.contains('Something went wrong ...').should('be.visible')
  })

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { forceNetworkError: true } // passando um objeto
    ).as('getNetworkFailure')
    cy.visit('/')
    cy.wait('@getNetworkFailure')
    cy.get('p:contains(Something went wrong ...)').should('be.visible')
  })
})

it.only('shows a "Loading ..." state before showing the results', () => {
  cy.intercept(
    'GET',
    '**/search**',
    {
      delay: 3000,
      fixture: 'stories'
    }
  ).as('getDelayedStories')

  cy.visit('/')

  cy.assertLoadingIsShownAndHidden()
  cy.wait('@getDelayedStories')

  cy.get('.item').should('have.length', 2)
})
